angular.module("linger.services").factory("lingerSocket", [ "socketFactory","UserService", function(socketFactory,UserService) {
  //  var myIoSocket = io.connect(BACKEND_SERVER_URL ,{userid: UserService.getUser()._id});

    mySocket = socketFactory({
       // ioSocket: myIoSocket,
        prefix: ''
    });

    return mySocket;
}]);