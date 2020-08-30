/* global __dirname */

const express = require(`express`);
const Firestore = require('@google-cloud/firestore');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { getUserWithDeviceId } = require('./user/user')
const { sendSpotifyAuthPrompt, spotifyLogin, spotifyCallback, getSpotifyUserPlaylists } = require('./spotify/spotifyClient')

const db = new Firestore(
    {
        projectId: 'aw-dms-demo',
    }
)

const H_KEY_DEVICEID = 'x-audiowings-deviceid';

const app = express()
app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser())

app.get('/', (req, res) => {
    res.send('<H1>Audio for your mind, body and soul</H1>');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080
const URL = process.env.npm_package_config_base_url
app.listen(PORT, () => {
    console.log(`Server ${process.env.npm_package_config_base_url} listening on port ${PORT}...`);
});

app.all('/*', (req, res, next) => {
    console.log(`>>> Incoming request: ${req.hostname}${req.url} - ${req.headers[H_KEY_DEVICEID] ? ('deviceid: ' + req.headers[H_KEY_DEVICEID]) : ''}`);
    next();
});

const sendConnectRes = (res, user) => {
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                // Instructs user to go to /login page in browser to authenticate spotify account 
                sendSpotifyAuthPrompt(res, user)
                break
            default:
                res.json({
                    deviceId: user.deviceId,
                    displayName: user.displayName,
                    contentProvider: 'Unknown content provider'
                })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const getPlaylists = (res, user) => {
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                // Instructs user to go to /login page in browser to authenticate spotify account 
                getSpotifyUserPlaylists(res, db, user)
                break
            default:
                res.json({
                    deviceId: user.deviceId,
                    displayName: user.displayName,
                    contentProvider: 'Unknown content provider'
                })
        }
    }
    catch (error) {
        console.log(error)
    }
}

app.get('/connect/', async (req, res) => {
    const userResult = await getUserWithDeviceId(db, req.headers[H_KEY_DEVICEID]);
    userResult.error ? res.json(userResult) : sendConnectRes(res, userResult)
})

app.get('/spotifylogin/:userId', async (req, res) => {
    console.log('userId', req.params.userId)
    spotifyLogin(res, req.params.userId, db)
});

app.get('/spotifycallback', (req, res) => {
    console.log('Code:', req.query.code)
    spotifyCallback(req, res, db)
})

app.get('/playlists/', async (req, res) => {
    const userResult = await getUserWithDeviceId(db, req.headers[H_KEY_DEVICEID]);
    userResult.error ? res.json(userResult) : getPlaylists(res, userResult)
})
