// listener, whenever the server emits 'updatechat', this updates the chat body
angular.module("linger.controllers").controller("chatController", [ "$scope", "lingerSocket","userService", function ($scope, lingerSocket,userService) {

    console.log(userService.GetRoomNum());

    // obtaining a new socket.
    var socket = io();
    var roomnum = $('#roomnum').val();

    socket.emit('switchroom', roomnum);//, id);
    socket.on('disconnect', function()
                            {
                                console.log("user Disconnected");
                            }
    );
    socket.on('updatechat', function (username, data)
                            {
                                $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
                            }
    );

    $(function() {
        // Send button handler
        $('#datasend').click(function () {
            console.log("got here!");

            var message = $('#data').val();
            $('#data').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('sendchat', message);
        });

        // when the client hits ENTER on their keyboard
        $('#data').keypress(function (e) {
            if (e.which == 13) {
                $(this).blur();
                console.log('key pressed');
                $('#datasend').focus().click();
            }
        });
    });
}]);

