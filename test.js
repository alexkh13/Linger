var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var _ = require('underscore');
var cors = require('cors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    key: 'sid'
}));

var groups = [
    { _id: 1, name: "test1", location: {} },
    { _id: 2, name: "test2", location: {} },
    { _id: 3, name: "test3", location: {} },
    { _id: 4, name: "test4", location: {} },
    { _id: 5, name: "test5", location: {} },
    { _id: 6, name: "test6", location: {} }
];

var messages = [
    { groupId: 1, text: "hello!", timestamp: 1441107555123 },
    { groupId: 2, text: "ma kore?!", timestamp: 1441107555100 },
    { groupId: 3, text: "hiiiii!", timestamp: 1441107554123 },
    { groupId: 4, text: "what appp!??!", timestamp: 1441107455127 },
    { groupId: 4, text: "what appp!??!", timestamp: 1441107545153 },
    { groupId: 4, text: "asfasf!", timestamp: 1441107555483 },
    { groupId: 5, text: "osfosaofsf!", timestamp: 1441107551193 },
    { groupId: 6, text: "!@#$%!", timestamp: 1441107553123 }
];

app.get("/", function(req, res) {
    res.sendFile("test.html", { root: __dirname });
});

app.get("/api/chat", function(req, res) {
    res.send(groups);
});

app.get("/api/chat/:groupId", function(req, res) {
    res.send(groups[req.params.groupId]);
});

app.get("/api/chat/:groupId/message", function(req, res) {
    res.send(_.where(messages, {groupId: parseInt(req.params.groupId) }));
});

server.listen(4000);
console.log(">> HTTP Server Running");