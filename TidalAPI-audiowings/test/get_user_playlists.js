let TidalAPI = require('../client');


// let api;

function getTidalApi(username, password) {
    return new TidalAPI({
        username: 'audiowingshifi',
        password: 'tidalaudiowings',
        token: 'Gi8gmFlBln6ozH4t',
    });
}



let api = getTidalApi('audiowingshifi', 'tidalaudiowings');
api.getUserPlaylists(function (sdata) {
    console.log('Getting pls');
    var playlistNumber = 1;
    sdata.items.forEach(playlist => {
        console.log(`${playlist.title} ${playlist.uuid}`);
        getPlaylist(playlist.uuid);
        playlistNumber++;
    });
})

function getPlaylist(playlistId) {
    api.getPlaylistTracks(playlistId, function (sdata) {
        var trackListNumber = 1;
        sdata.items.forEach(track => {
            console.log(`${trackListNumber} ${track.title}`);
            trackListNumber++;
        });

    })
}




