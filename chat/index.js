var chat = require('express').Router();
var chathandler = require('./chathandler');
var _ = require('underscore');
var lingerDB = require('./db');

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


/*var usersSocketCache = {};*/

module.exports = function(io){

    io.on('connection', function (socket) {

        console.log("user connected");

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (msgdata) {

            //Check if the all the groups users are connected if not- keep the messages for the rest of them

            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.in(socket.room).emit('updatechat', socket.username, msgdata);
        });

        socket.on('useradd', function(UserInfo)
        {
            // Check if the user requesting to add has permissions to add

            // Check if the user added to the group isnt already a member

            // add the user to the group + send updatechat to that users socket. ! we need to save the sockets to our users the minute they get connected!
            // add the client's username to the global list
            //usernames[username] = username;
        });

        socket.on('switchroom', function (roomnum){
            var username = socket.id;

            // store the username in the socket session for this client
            socket.username = username;

            // Check authenticity of the Client here! and that he belongs to the group

            // adding the client to the wanted room
            socket.leave(socket.room);
            socket.join(roomnum);

            // store the room name in the socket session for this client
            socket.room = roomnum;
        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (data) {
            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.in(socket.room).emit('updatechat', socket.username, data);

            // add the message to the messages collection
        });

        socket.on('disconnect', function(){

            console.log('user disconnected');

            // Dispose of users saved socket
        });
    });

};