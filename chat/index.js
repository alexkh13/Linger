var chat = require('express').Router();
var chathandler = require('./chathandler');
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

chat.get("/", function(req, res) {
    req.db.getGroups().then(function (docs) {
        res.send(docs);
    }, handleError);
});


/*var userscache = {};
var roomscache = {};*/

module.exports = function(io){

    io.on('connection', function (socket) {
        console.log("user connected");
        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (msgdata) {

            //Check if the all the groups users are connected if not- keep the messages for the rest of them

            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.in(socket.room).emit('updatechat', socket.username, msgdata);
        });

        // when the client emits 'adduser', this listens and executes
        socket.on('switchroom', function (roomnum){//username) {
            var username = socket.id;

            // store the username in the socket session for this client
            socket.username = username;

            // add the user to the cache
            if (userscache.find(username))
            {

            }

            // send client to room 1
            socket.join(roomnum);

            // store the room name in the socket session for this client
            socket.room = roomnum;

            // add the client's username to the global list
            //usernames[username] = username;


            // echo to client they've connected
            //socket.emit('updatechat', 'you have connected to room1');

            // echo to room 1 that a person has connected to their room
            socket.broadcast.to('room1').emit('updatechat', /*username added username that was added */username + ' was added');
        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (data) {
            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.in(socket.room).emit('updatechat', socket.username, data);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });

};