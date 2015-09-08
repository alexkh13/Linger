var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var fs = require('fs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var _ = require('underscore');
var q = require('q');

var MongoClient = require('mongodb').MongoClient;

var lingerDB = require('./db');

//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    key: 'sid'
}));

var PUBLIC_DIR = __dirname + "/www";
var CORDOVA_WWW = __dirname + "/platforms/browser/www";

// expose BACKEND_SERVER_URL globally
var env = (process.env['ENVIRONMENT'] || "local").toLocaleLowerCase();
eval(fs.readFileSync(__dirname + "/config/config-" + env + ".js", "utf8"));
GLOBAL.BACKEND_SERVER_URL = BACKEND_SERVER_URL;

app.use('/js', express.static(PUBLIC_DIR + '/js'));
app.use('/css', express.static(PUBLIC_DIR + '/css'));
app.use('/html', express.static(PUBLIC_DIR + '/html'));
app.use('/fonts', express.static(PUBLIC_DIR + '/fonts'));
app.use('/images', express.static(PUBLIC_DIR + '/images'));
app.use('/plugins', express.static(CORDOVA_WWW + '/plugins')); // cordova

function initializeDB(db) {
    db.collection('groups').createIndex({"location": "2dsphere"}, function(err) {
        if(err) {
            console.log(err);
        }
    });
    db.collection('Messages').createIndex( { timestamp : 1 } ), function(err) {
        if(err) {
            console.log(err);
        }
    };
    function empty(col) {
        var deferred = q.defer();
        db.collection(col).remove({}, function() {
            deferred.resolve();
        });
        return deferred.promise;
    }
    if(fs.existsSync(__dirname + "/db/dump")) {
        console.log(">> Please wait, importing data...");
        var collections = ["users","groups","messages"];
        var all = [];
        _.each(collections, function(col) {
            all.push(empty(col));
        });
        q.all(all).then(function() {
            // import
            var exec = require('child_process').exec;
            exec(/^win/.test(process.platform) ? 'mongorestore.exe' : "mongorestore", {
                cwd: __dirname + '/db'
            }, function(error, stdout, stderr) {
                if(error) {
                    console.log(error);
                    console.log(">> ERROR IMPORTING DATA");
                }
                else {
                    console.log(">> Import success");
                }
            });
        })
    }
}

MongoClient.connect('mongodb://127.0.0.1:27017/lingerdb', function(err, db) {
    if (err) throw err;
    console.log(">> Connected to Database");

    initializeDB(db);

    var mongo = lingerDB.getAdapter('mongodb')(db);

    app.use(function(req, res, next) {
        req.db = mongo;
        req.io = io;
        next();
    });
    require('./api/chat/Listener')(io,mongo);
    //initializeDB(db);

    app.use("/api", require('./api'));

    app.all('/cordova.js', function(req, res) {
        res.sendFile(CORDOVA_WWW + '/cordova.js');
    });

    app.all('/cordova_plugins.js', function(req, res) {
        res.sendFile(CORDOVA_WWW + '/cordova_plugins.js');
    });

    app.all('/*', function(req, res) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile(PUBLIC_DIR + "/index.html");
    });

});

module.exports = server;
//module.exports = app;