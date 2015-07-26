var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var lingerDB = require('./db');

//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function initializeDB(db) {
    db.collection('groups').createIndex({"location": "2dsphere"}, function(err) {
        if(err) {
            console.log(err);
        }
    });
}

MongoClient.connect('mongodb://127.0.0.1:27017/lingerdb', function(err, db) {
    if (err) throw err;
    console.log(">> Connected to Database");

    app.use(function(req, res, next) {
        req.db = lingerDB.getAdapter('mongodb')(db);
        req.io = io;
        next();
    });

    app.use("/api", require('./api'));

    server.listen(3000);

});
