var user = require('express').Router();
var FB = require('fb');

user.get("/friends", function(req, res) {
    FB.api("me/friends", { access_token: req.user.accessToken, fields: ['id','name','picture'] }, function(response) {
        res.send(response);
    })
});

user.get("/lookup", function(req, res) {
    var loc = {
        longitude: parseFloat(req.query.longitude),
        latitude: parseFloat(req.query.latitude)
    };
    req.db.findUsers(req.user._id).then(function(users) {
        res.send(users);
    }, function(err) {
        res.status(500);
        res.send(err);
    })
});

module.exports = user;