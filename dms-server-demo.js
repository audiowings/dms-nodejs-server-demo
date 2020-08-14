/* global __dirname */

const express = require(`express`);
const app = express();[[]]
const Firestore = require('@google-cloud/firestore');

const db = new Firestore(
    {
        projectId: 'aw-dms-demo',
    }
);

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
    // const authUrl = 'https://accounts.spotify.com/authorize?client_id=e72425a3bb674afea196d0bf99628a1e&response_type=code&redirect_uri=https://aw-dms-demo.nw.r.appspot.com/&scope=playlist-read-private%20playlist-read-collaborative'
    // authoriseScopes(authUrl)
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

app.get('/connect/', async (req, res) => {
    const deviceId = req.headers[H_KEY_DEVICEID];
    const result = await getUser(deviceId);
    result.error ? res.json(result) : res.json({ deviceId: result.deviceId, displayName: result.displayName });
})
