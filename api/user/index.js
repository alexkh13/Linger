var user = require('express').Router();
var FB = require('fb');

user.get("/friends", function(req, res) {
    FB.api("me/friends", { access_token: req.user.accessToken, fields: ['id','name','picture'] }, function(response) {
        res.send(response);
    })
});

module.exports = user;