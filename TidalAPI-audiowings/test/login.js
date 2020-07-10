var TidalAPI = require('./client');


var api = new TidalAPI({
    username: 'audiowingshifi',
    password: 'tidalaudiowings',
    token: 'wdgaB1CilGA-S_s2',
    clientVersion: '2.2.1--7',
    quality: 'LOSSLESS'
});

api.userLogin(function(data){
    console.log(`Session data = ${data}`);
});



