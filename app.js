var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
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
//app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    key: 'sid'
}));

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/html', express.static(__dirname + '/public/html'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/images', express.static(__dirname + '/public/images'));

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

    var mongo = lingerDB.getAdapter('mongodb')(db);

    app.use(function(req, res, next) {
        req.db = mongo;
        req.io = io;
        next();
    });

    app.use("/api", require('./api'));

    app.all('/*', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('public/index.html', { root: __dirname });
    });

    server.listen(3000);

});
