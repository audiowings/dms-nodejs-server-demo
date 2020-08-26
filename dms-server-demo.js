/* global __dirname */

const express = require(`express`);
const Firestore = require('@google-cloud/firestore');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { sendSpotifyAuthPrompt,spotifyLogin, spotifyCallback } = require('./spotify/spotifyClient')

const db = new Firestore(
    {
        projectId: 'aw-dms-demo',
    }
)

async function getUser(deviceId) {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('deviceId', '==', deviceId).get();
        if (snapshot.empty) throw `No user found with deviceId: ${deviceId}`
        const user = snapshot.docs[0].data()
        user.id = snapshot.docs[0].id
        console.log(`Matched deviceId: ${deviceId} to user: ${user.displayName}`)
        return user
    } catch (expression) {
        console.log('Error: getUser', expression);
        return { error: expression }
    }
}

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
const URL =  process.env.npm_package_config_base_url
app.listen(PORT, () => {
    console.log(`Server ${process.env.npm_package_config_base_url} listening on port ${PORT}...`);
});

app.all('/*', (req, res, next) => {
    console.log(`>>> Incoming request: ${req.hostname}${req.url} - ${req.headers[H_KEY_DEVICEID]? ('deviceid: ' + req.headers[H_KEY_DEVICEID]) : ''}`);
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

app.get('/connect/', async (req, res) => {
    const userResult = await getUser(req.headers[H_KEY_DEVICEID]);
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

app.get('/refresh_token', function(req, res) {})
