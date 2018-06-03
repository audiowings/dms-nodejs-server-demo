/* global __dirname */

const NODE_MODULES = '/dev/node.js/node_modules';
const http = require(`http`);
const url = require(`url`);
let express = require(`${NODE_MODULES}/express`);
let path = require('path');
const fs = require('fs');

let app = express();

const TidalAPI = require('../TidalAPI/client');

const HOSTNAME = '192.168.0.16';
const PORT = 3000;

// const TIDAL_TOKEN = 'Gi8gmFlBln6ozH4t';
const TIDAL_TOKEN = 'Gi8gmFlBln6ozH4t';
const TIDAL_CLIENT_VERSION = '2.2.1--7';

let providersEnum = {
  DEVICE: 1,
  AUDIOWINGS: 2,
  TIDAL: 3,
  properties: {
    1: {
      providerName: 'Device',
      providerToken: null,
      providerClientVer: null
    },
    2: {
      providerName: 'Audiowings',
      providerToken: null,
      providerClientVer: null
    },
    3: {
      providerName: 'Tidal',
      providerToken: TIDAL_TOKEN,
      providerClientVer: '2.2.1--7'
    }
  }
};

const H_KEY_DEVICEID = 'x-audiowings-deviceid';
const P_KEY_PLAYLISTID = 'playlistId';

// audiowingshifi (Standard HiFi account)
// audiowingsprem (Standard Premium account)
// audiowingsintro (inactive account)

let usersObj = {
  'users': [
    {
      'userId': '1',
      'displayname': 'Harry HiFi',
      'deviceId': 'FF-01-25-79-C7-EC',
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
    }
  ]
}


// let tidalApi;

// Define the port to run on
app.set('port', PORT);

app.use(express.static(path.join(__dirname, 'public')));



// Listen for requests
let server = app.listen(app.get('port'), function () {
  let port = server.address().port;
  console.log('Magic happens on port ' + port);
});

app.all('/*', (req, res, next) => {
  console.log('>>> Incoming request url:', req.hostname + req.url);
  next();
});

app.get('/' + usersObj.users[0].deviceId, function (req, res) {
  let username = usersObj.users[0].displayname;
  res.json({ user: username });
});

app.get('/playlists/', (req, res) => {
  let deviceIdIn = req.headers[H_KEY_DEVICEID];
  let tidalUser = getTidalUser(deviceIdIn);

  getTidalApi(tidalUser.tidalUsername, tidalUser.tidalPassword)
    .then(tidalApi => getTidalPlaylists(tidalApi))
    .then(playlistsData => {
      // console.log('Playlists...', playlistsData)
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

async function insertUrlInfo (api, playlistData) {
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
      token: TIDAL_TOKEN
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
  try{
  return new Promise((resolve, reject) => {
    tidalApi.getPlaylistTracks(playlistId, playlistData => {
      // Add title and provider id to the playlist object
      playlistData.title = title;
      playlistData.providerId = providersEnum.TIDAL;
      resolve(playlistData);
      reject("PROBLEMO");
    });
  });
}catch(e){console.log(e)}
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
function getTidalTrackUrlInfo (tidalApi, trackId) {
  const urlUsagemode = "OFFLINE";
  const assetPresentation = "FULL";
  try{
  return new Promise((resolve) => {
    tidalApi.getTrackURL(trackId, urlUsagemode, assetPresentation, "LOW", trackUrlInfo => {
      resolve(trackUrlInfo)
    });
  });
} catch(e) {console.log(e)}
}
