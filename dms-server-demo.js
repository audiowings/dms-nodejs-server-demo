/* global __dirname */

const express = require(`express`);
const path = require('path');
const app = express();[[]]
const TidalAPI = require('./TidalAPI-audiowings/client');
const { ProvidersEnum } = require("./data/providers");
const { users } = require("./data/users");

const H_KEY_DEVICEID = 'x-audiowings-deviceid';
const P_KEY_PLAYLISTID = 'playlistId';

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

app.all('/*', (req, res, next) => {
    console.log('>>> Incoming request url:', req.hostname + req.url);
    next();
});

function getUser(deviceId) {
    return users.find(user => user.deviceId == deviceId)
}

app.get('/connect/', (req, res) => {
    let deviceId = req.headers[H_KEY_DEVICEID];
    let user = getUser(deviceId);
    res.json(user);
});

app.get('/playlists/', (req, res) => {
    let deviceId = req.headers[H_KEY_DEVICEID];
    let tidalUser = getUser(deviceId);
    console.log('Getting playlists...')

    getTidalApi(tidalUser.tidalUsername, tidalUser.tidalPassword)
        .then(tidalApi => getTidalPlaylists(tidalApi))
        .then(playlistsData => {
            console.log('Playlists...', playlistsData)
            res.json(playlistsData);
        })
});


app.get('/playlist/', (req, res) => {
    let deviceIdIn = req.headers[H_KEY_DEVICEID];
    let tidalUser = getTidalUser(deviceIdIn);

    let playlistId = req.query.playlistId;
    let playlistTitle = req.query.playlistTitle;

    let api;


    getTidalApi(tidalUser.tidalUsername, tidalUser.tidalPassword)
        .then(tidalApi => {
            api = tidalApi;
            playlistData = getTidalPlaylist(tidalApi, playlistId, playlistTitle);
            return playlistData;
        })
        .then(playlistData => insertUrlInfo(api, playlistData))
        .then(finalData => res.json(finalData));
});

async function insertUrlInfo(api, playlistData) {
    for (let item in playlistData.items) {
        let trackId = playlistData.items[item].id
        await getTidalTrackUrlInfo(api, trackId)
            .then(urlInfo => playlistData.items[item].urlInfo = urlInfo);
    }
    return playlistData
}

function getTidalUser(deviceId) {
    for (i in usersObj.users) {
        if (usersObj.users[i].deviceId === deviceId) {
            let tidalUser = usersObj.users[i];
            return (tidalUser);
        }
    }
}

const getTidalApi = (username, password) => {
    return new Promise((resolve, reject) => {
        resolve(new TidalAPI({
            username: username,
            password: password,
            token: ProvidersEnum.TIDAL.providerToken
        }));
        reject(console.log("Something wrong!", error));
    });
}

// Get Tidal Playlists
function getTidalPlaylists(tidalApi) {
    return new Promise((resolve, reject) => {
        tidalApi.getUserPlaylists(res => {
            // Create empty items array
            let playlistsData = { items: [] };
            // Create a new item containing only track title and uuid from each response array item
            for (let item in res.items) {
                let newItem = {
                    title: res.items[item].title,
                    playlistId: res.items[item].uuid
                }
                // Add the cut down playlist item to the new items array
                playlistsData.items.push(newItem);
            }
            resolve(playlistsData);
        });
    });
}

// const playlistTracks = playlistId => new Promise(resolve => tidalApi.getPlaylistTracks(playlistId, resolve));

// Get Tidal Playlist
const getTidalPlaylist = (tidalApi, playlistId, title) => {
    // let playlistData;
    try {
        return new Promise((resolve, reject) => {
            tidalApi.getPlaylistTracks(playlistId, playlistData => {
                // Add title and provider id to the playlist object
                playlistData.title = title;
                playlistData.providerId = ProvidersEnum.TIDAL;
                resolve(playlistData);
                reject("PROBLEMO");
            });
        });
    } catch (e) { console.log(e) }
}


/*
http://developer.tidal.com/technical/playback/
audioquality – Requested quality. Enum: HI_RES, LOSSLESS, HIGH, LOW
Sound quality (old version)
NORMAL = HE AAC v1 96 Kbps (AAC+)
HIGH = AAC 320 Kbps
LOSSLESS = FLAC 44.1/16 (Master quality if available)

assetpresentation – Requested asset presentation. Enum: FULL, PREVIEW
*/

// Get Tidal Track URL Info
function getTidalTrackUrlInfo(tidalApi, trackId) {
    // const urlUsagemode = "OFFLINE";
    const urlUsagemode = "STREAM";
    const assetPresentation = "FULL";
    try {
        return new Promise((resolve) => {
            tidalApi.getTrackURL(trackId, urlUsagemode, assetPresentation, "LOW", trackUrlInfo => {
                resolve(trackUrlInfo)
            });
        });
    } catch (e) { console.log(e) }
}
