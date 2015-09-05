angular.module("linger.services").factory("UserService", [ function() {

    var currUser = {};

    var users = {
        bar: {
            name: "Bar Refaeli"
        },
        bibi: {
            name: "Benjamin Netanyahu"
        },
        buji: {
            name: "Issac Herzog"
        },
        tzipi: {
            name: "Tzipi Livni"
        }
    };

    return {
        setUser:function(user){
            currUser = user;
        },
        getUser: function() {
            return currUser;
        }
    }

}]);