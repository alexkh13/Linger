var passport = require('passport');
//var FacebookStrategy = require('passport-facebook').Strategy;
var CustomStrategy = require('passport-custom').Strategy;
var FB = require('fb');
var api = require('express').Router();
var q = require('q');

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
        FB.api('me', { fields: ['id', 'name'], access_token: authResponse.accessToken }, function (profile) {
            req.db.updateUser(authResponse.userID, profile, authResponse.accessToken).then(function(user) {
                    done(null, user);
                },
                function(err) {
                    done(err, false);
                });
        });
    }
));

api.post('/auth/facebook',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
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

//// Redirect the user to Facebook for authentication.  When complete,
//// Facebook will redirect the user back to the application at
////     /auth/facebook/callback
//api.get('/auth/facebook', passport.authenticate('facebook', { scope: ['user_about_me', 'user_friends'] }));

//// Facebook will redirect the user to this URL after approval.  Finish the
//// authentication process by attempting to obtain an access token.  If
//// access was granted, the user will be logged in.  Otherwise,
//// authentication has failed.
//api.get('/auth/facebook/callback',
//    passport.authenticate('facebook', { successRedirect: '/',
//        failureRedirect: '/login' }));

api.get('/auth', function(req, res) {
    res.send(req.user);
});

api.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

api.use(function(req, res, next) {
    if (!req.user) {
        res.status(401);
        res.end();
    }
    else {
        next();
    }
});

api.use("/chat", require("./chat"));
api.use("/user", require("./user"));

module.exports = api;