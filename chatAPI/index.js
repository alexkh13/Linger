/**
 * Created by Brutus on 22/08/2015.
 */
var chatapi = require('express').Router();
var geolib = require('./geolib');
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

chatapi.get("/", function(req, res) {
    req.db.getChatGroups().then(function (docs) {
        res.send(docs);
    }, handleError);
});

chatapi.get("/:userid", function(req, res) {
    var user = {userid: parseFloat(req.params.userid)};


    req.db.getClosestChatGroups(user).then(function(docs) {
        res.send(docs);
    }, handleError);
});

chatapi.post("/", function(req, res) {


});

module.exports = chatapi;