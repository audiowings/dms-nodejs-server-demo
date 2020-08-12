// audiowingshifi (Standard HiFi account)
// audiowingsprem (Standard Premium account)
// audiowingsintro (inactive account)

// To be replaced by database

const { providers } = require("./providers");

const users = [
    {
        'userId': '1',
        'displayname': 'Harry HiFi',
        'deviceId': 'FF-01-25-79-C7-EC',
        defaultProvider: providers.TIDAL,
        'tidalUsername': 'audiowingshifi',
        'tidalPassword': 'tidalaudiowings',
        'tidalSessionId': null,
    },
    {
        'userId': '2',
        'displayname': 'Pamela Premium',
        'deviceId': '40-34-F1-48-48-3F',
        'tidalUsername': 'audiowingsprem',
        'tidalPassword': 'tidalaudiowings',
    },
    {
        'userId': '3',
        'displayname': 'Ian Inactive',
        'deviceId': '80-62-E5-FB-9B-C5',
        'tidalUsername': 'audiowingsintro',
        'tidalPassword': 'tidalaudiowings',
    },
    {
        userId: '4',
        displayname: 'JR Sony Xperia 10+',
        deviceId: '38-78-62-61-F7-7C',
        defaultProvider: providers.SPOTIFY
    }
]

exports.users = users