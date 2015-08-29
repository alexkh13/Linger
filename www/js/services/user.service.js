angular.module("linger.services").factory("UserService", [ function() {

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
        getUser: function(id) {
            return angular.copy(users[id])
        }
    }

}]);