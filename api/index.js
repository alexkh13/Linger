var passport = require('passport');
//var FacebookStrategy = require('passport-facebook').Strategy;
var CustomStrategy = require('passport-custom').Strategy;
var FB = require('fb');
var api = require('express').Router();
var q = require('q');
var request = require('request');
// passport authentication setup
api.use(passport.initialize());
api.use(passport.session());

//passport.use(new FacebookStrategy({
//        clientID: 361668527356399,
//        clientSecret: "a6e2d899475a1fd5c1b7ba31bbafb36c",
//        callbackURL: "http://localhost:3000/api/auth/facebook/callback",
//        passReqToCallback: true
//    },
//    function(req, accessToken, refreshToken, profile, done) {
//        req.db.updateUser(profile.id, profile, accessToken).then(function(user) {
//            done(null, user);
//        },
//        function(err) {
//            done(err, false);
//        });
//    }
//));

passport.use('facebook', new CustomStrategy(
    function(req, done) {
        var authResponse = req.body;
        FB.api('me', { fields: ['id', 'name', 'picture'], access_token: authResponse.accessToken }, function (profile) {


                //var p = profile();
               var options = {
                    host: profile.picture.data.url ,
                    port: 80
                };

            request
                .get(profile.picture.data.url)
                .on('response', function(res) {

                    var buffers = [];
                    var length = 0;

                    res.on("data", function(chunk) {

                        // store each block of data
                        length += chunk.length;
                        buffers.push(chunk);

                    });

                    res.on("end", function() {

                        // combine the binary data into single buffer
                        var image =  Buffer.concat(buffers).toString("base64");

                        // determine the type of the image
                        // with image/jpeg being the default
                        var type = 'image/jpeg';
                        if (res.headers['content-type'] !== undefined)
                            type = res.headers['content-type'];

                        profile.picture = {type:type, image:image};

                        req.db.updateUser(authResponse.userID, profile, authResponse.accessToken).then(function(user) {   done(null, user);
                            },
                            function(err) {
                                done(err, false);
                            });
                    });
                });

           // req.db.updateUser(authResponse.userID, profile, authResponse.accessToken).then(function(user) {
           //         done(null, user);
           //     },
           //     function(err) {
           //         done(err, false);
           //     });
        });
    }
));

passport.use('basic', new CustomStrategy(
    function(req, done) {
        var email = req.body.email;
        var password = require('sha1')(req.body.password);
        req.db.checkUser(email, password).then(function(user){
            done(null, user);
        }, function(err) {
            done(err, false);
        })
    }
));

api.post('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {
        res.send(req.user);
    });

api.post('/auth/basic',
    passport.authenticate('basic'),
    function(req, res) {
        res.send(req.user);
    });

passport.serializeUser(function(req, user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(req, id, done) {
    req.db.getUserById(id).then(function(user) {
        done(null, user);
    },
    function(err) {
        done(err, false);
    })
});

api.get('/auth', function(req, res) {
    res.send(req.user);
});

api.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

api.use(function(req, res, next) {
    if (req.originalUrl != '/api/user/register' && !req.user) {
        res.status(401);
        res.end();
    }
    else {
        next();
    }
   // next();
});

api.use("/chat", require("./chat"));
api.use("/user", require("./user"));
api.use("/map", require("./map"));

module.exports = api;