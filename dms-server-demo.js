/* global __dirname */

const express = require(`express`);
const app = express();[[]]
const Firestore = require('@google-cloud/firestore');
const { startSpotifyAuth } = require('./spotify/spotifyClient')

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
        console.log(`Matched deviceId: ${deviceId} to user: ${user.displayName}`)
        return user
    } catch (expression) {
        console.log('Error: getUser', expression);
        return { error: expression }
    }
}

const H_KEY_DEVICEID = 'x-audiowings-deviceid';

app.get('/', (req, res) => {
    res.send('<H1>Audio for your mind, body and soul</H1>');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

app.all('/*', (req, res, next) => {
    console.log(`>>> Incoming request: ${req.hostname}${req.url} - deviceid: ${req.headers[H_KEY_DEVICEID]}`);
    next();
});

const sendConnectRes = (res, user) => {
    try {
        switch (user.defaultProvider) {
            case 'spotify':
                startSpotifyAuth(db, res, user)
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
    const deviceId = req.headers[H_KEY_DEVICEID];
    const userResult = await getUser(deviceId);
    userResult.error ? res.json(userResult) : sendConnectRes(res, userResult)
})
