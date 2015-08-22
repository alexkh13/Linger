/**
 * Created by Brutus on 02/08/2015.
 */
var chathan = require('express').Router();
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

chathan.get("/", function(req, res) {
    req.db.getChatGroups().then(function (docs) {
        res.send(docs);
    }, handleError);
});

module.exports = chathan;