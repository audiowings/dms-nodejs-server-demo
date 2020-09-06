/* global __dirname */

const express = require(`express`);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { getUserWithDeviceId } = require('./database/database')
const { getSpotifyAuthPromptData, spotifyLogin, spotifyCallback, getSpotifyUserPlaylists, getSpotifyUserPlaylist } = require('./spotify/spotifyClient')

const H_KEY_DEVICEID = 'x-audiowings-deviceid';
const H_KEY_PLAYLIST_URL = 'x-audiowings-playlist_url';

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
    console.log(`Server ${URL} listening on port ${PORT}...`);
});

app.all('/*', (req, res, next) => {
    console.log(`>>> Incoming request: ${req.hostname}${req.url} - ${req.headers[H_KEY_DEVICEID] ? ('deviceid: ' + req.headers[H_KEY_DEVICEID]) : ''}`);
    next();
});

const sendConnectRes = (res, user) => {
    const body = {
        deviceId: user.deviceId,
        displayName: user.displayName,
        userId: user.id,
    }
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                // Instructs user to go to /login page in browser to authenticate spotify account 
                if (user.spotifyRefreshToken === "undefined") {
                    const data = getSpotifyAuthPromptData(user)
                    res.set(data.headers)
                }
                body.contentProvider = 'spotify'
                break
            default:
                body.contentProvider = 'Unknown content provider'
        }
        res.json(body)
    }
    catch (error) {
        console.log(error)
    }
}

const getPlaylists = async (res, user) => {
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                const playlists = await getSpotifyUserPlaylists(user)
                res.json(playlists.data)
                break
            default:
                res.json({
                    Message: 'No playlists'
                })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const getPlaylist = async (res, user, playlistUrl) => {
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                const playlist = await getSpotifyUserPlaylist(user, playlistUrl)
                res.json(playlist.data)
                break
            default:
                res.json({
                    Message: 'No playlist'
                })
        }
    }
    catch (error) {
        console.log(error)
    }
}


app.get('/connect/', async (req, res) => {
    const userResult = await getUserWithDeviceId(req.headers[H_KEY_DEVICEID]);
    userResult.error ? res.json(userResult) : sendConnectRes(res, userResult)
})

app.get('/spotifylogin/:userId', async (req, res) => {
    console.log('userId', req.params.userId)
    spotifyLogin(res, req.params.userId)
})

app.get('/spotifycallback', (req, res) => {
    console.log('Code:', req.query.code)
    spotifyCallback(req, res)
})

app.get('/playlists/', async (req, res) => {
    const userResult = await getUserWithDeviceId(req.headers[H_KEY_DEVICEID]);
    userResult.error ? res.json(userResult) : await getPlaylists(res, userResult)
})

app.get('/playlist/', async (req, res) => {
    const userResult = await getUserWithDeviceId(req.headers[H_KEY_DEVICEID]);
    const playlistUrl = req.headers[H_KEY_PLAYLIST_URL]
    userResult.error ? res.json(userResult) : await getPlaylist(res, userResult, playlistUrl)
})
