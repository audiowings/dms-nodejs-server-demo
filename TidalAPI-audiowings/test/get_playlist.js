var TidalAPI = require('../client');


var api = new TidalAPI({
    username: 'audiowingshifi',
    password: 'tidalaudiowings',
    token: 'Gi8gmFlBln6ozH4t',
    clientVersion: '2.2.1--7',
    quality: 'LOSSLESS'
});



api.getPlaylistTracks('5e962625-2783-46b2-a3fc-2228afc92e9b', function(sdata){
    var trackListNumber = 1;
    sdata.items.forEach(track => {
        console.log(`${trackListNumber} ${track.title}`);
        trackListNumber++;
    });
    
})