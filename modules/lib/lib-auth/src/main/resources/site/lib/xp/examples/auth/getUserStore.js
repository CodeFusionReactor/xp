var authLib = require('/lib/xp/auth');
var t = require('/lib/xp/testing');

var principal = authLib.getUserStore({key: 'myUserStore'});

var expected = {
    "key": "myUserStore",
    "displayName": "User store test",
    "description": "User store used for testing",
    "authConfig": {
        "applicationKey": "com.enonic.app.test",
        "config": [
            {
                "name": "title",
                "type": "String",
                "values": [
                    {
                        "v": "App Title"
                    }
                ]
            },
            {
                "name": "avatar",
                "type": "Boolean",
                "values": [
                    {
                        "v": true
                    }
                ]
            },
            {
                "name": "forgotPassword",
                "type": "PropertySet",
                "values": [
                    {
                        "set": [
                            {
                                "name": "email",
                                "type": "String",
                                "values": [
                                    {
                                        "v": "noreply@example.com"
                                    }
                                ]
                            },
                            {
                                "name": "site",
                                "type": "String",
                                "values": [
                                    {
                                        "v": "MyWebsite"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

t.assertJsonEquals(expected, principal);
