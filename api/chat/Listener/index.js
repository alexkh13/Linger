/**
 * Created by Brutus on 02/09/2015.
 */
var _ = require('underscore');

module.exports = function(io,db){

    io.sockets.on('connection', function (socket) {
        db.getGroups({userid: socket.request.userid}).then(function(entries){
            _.each(entries, function(entry) {
                socket.join(entry._id);
               // console.log("entry._id"+entry._id);
               // console.log("entry._id.id"+entry._id.id);
            });
        });

        socket.on('subscribe', function(data) {
            socket.join(data.groupid); });

        socket.on('unsubscribe', function(data) { socket.leave(data.groupid); });
    });
};