/* global __dirname */

const express = require(`express`);
const app = express();[[]]
const { users } = require("./data/users");

const H_KEY_DEVICEID = 'x-audiowings-deviceid';

app.get('/', (req, res) => {
    res.send('<H1>Audio for your mind, body and soul</H1>');
    // const authUrl = 'https://accounts.spotify.com/authorize?client_id=e72425a3bb674afea196d0bf99628a1e&response_type=code&redirect_uri=https://aw-dms-demo.nw.r.appspot.com/&scope=playlist-read-private%20playlist-read-collaborative'
    // authoriseScopes(authUrl)
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
    res.json({displayName: user.displayname});
})
