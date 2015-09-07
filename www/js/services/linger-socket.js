angular.module("linger.services").factory("lingerSocket", [ "socketFactory","UserService", function(socketFactory,UserService) {
    var myIoSocket = io.connect(BACKEND_SERVER_URL == "/" ? undefined : BACKEND_SERVER_URL);

    mySocket = socketFactory({
        ioSocket: myIoSocket,
        prefix: ''
    });

    return mySocket;
}]);