angular.module("linger.services").factory("ChatService", [ "UserService", function(UserService) {

    var TYPES = {
        GROUP: "",
        PRIVATE: "",
        SERVICE: ""
    };

    function Chat(data) {
        angular.extend(this, data);
    }

    Chat.prototype = {

    };

    var mock = [
    /**
     *
     */
        {
            type: TYPES.GROUP,
            created: {
                by: "bibi",
                timestamp: 86543
            },
            options: {
                name: "טיול לרומא",
                isThreaded: false,
                isPrivate: true
            },
            members: [ "bibi", "buji", "tzipi" ]
        },
    /**
     *
     */
        {
            type: TYPES.GROUP,
            created: {
                by: "yehuda",
                timestamp: 86543
            },
            options: {
                name: "המתמטיקה שמאחורי מנועי החיפוש וכריית המידע",
                isThreaded: true,
                isPrivate: false
            },
            members: [ "yehuda", "yakir" ],
            threads: [
                {
                    _id: 1,
                    options: {
                        name: "סמסטר א 2015"
                    }
                },
                {
                    _id: 2,
                    options: {
                        name: "סמסטר קיץ 2014"
                    }
                }
            ]
        },
    /**
     *
     */
        {
            type: TYPES.GROUP,
            created: {
                by: "nimrod"  ,
                timestamp: 876543
            },
            options: {
                name: "הנדסת תוכנה מכוונת עצמים",
                isThreaded: true,
                isPrivate: false
            },
            members: [ "alex", "dina", "matan", "or", "yehuda", "nimrod", "eran", "dima" ],
            threads: [
                {
                    _id: 1,
                    created: {
                        by: "nimrod",
                        timestamp: 45678
                    },
                    options: {
                        name: "פטפוטים"
                    },
                    members: [ "matan", "yehuda", "dima" ]
                },
                {
                    _id: 2,
                    created: {
                        by: "alex",
                        timestamp: 45678
                    },
                    options: {
                        name: "צוות 5",
                        isPrivate: true,
                        members: [ "alex", "yehuda", "nimrod", "eran", "dima" ]
                    }
                }
            ]
        },
    /**
     *
     */
        {
            type: TYPES.PRIVATE,
            created: {
                by: "alex",
                timestamp: 98765
            },
            members: [ "alex", "bar" ]
        },
    /**
     *
     */
        {
            type: TYPES.SERVICE,
            created: {
                by: "ofer",
                timestamp: 9876543
            },
            options: {
                name: "בזק בינלאומי",
                isThreaded: true,
                isSessionBased: true,
                admins: [ "moshe" ],
                serviceProviders: [ "anat", "rahel" ]
            },
            members: [ "alex" ],
            threads: [
                {
                    _id: 1,
                    options: {
                        name: "הצטרפות"
                    },
                    threads: [
                        {
                            _id: 1,
                            options: {
                                isActive: true
                            },
                            members: [ "alex" ],
                            serviceProviders: [ "anat" ]
                        }
                    ]
                },
                {
                    _id: 2,
                    options: {
                        name: "שירות לקוחות",
                        serviceProviders: [ "anat" ]
                    },
                    threads: []
                },
                {
                    _id: 3,
                    options: {
                        name: "תמיכה טכנית",
                        serviceProviders: [ "rahel" ]
                    },
                    threads: []
                }
            ]
        },
    /**
     *
     */
        {
            type: TYPES.SERVICE,
            created: {
                by: "alex",
                timestamp: 9876543,
                serviceProviders: [ "alex", "orit" ],
                admins: [ "orit" ]
            },
            options: {
                name: "דירה יפיפיה להשכרה באזור השלישיות רמת גן"
            },
            threads: [
                {
                    _id: 1,
                    members: [ "shiran" ]
                }
            ],
            members: [ "shiran" ]
        }
    ];

    return {
        getChats: function() {
            return _.map(mock, function(data) {
                return new Chat(data);
            })
        },
        Types: TYPES
    }

}]);