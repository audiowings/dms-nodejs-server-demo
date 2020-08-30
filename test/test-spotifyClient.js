const test = require('ava');
const rewire = require('rewire')
const Firestore = require('@google-cloud/firestore');
const { getSpotifyUserPlaylists } = require('../spotify/spotifyClient')


const mod = rewire('../spotify/spotifyClient.js');
const needsRefresh = mod.__get__('needsRefresh');
const spotifyRefresh = mod.__get__('spotifyRefresh');

const getDb = (projectId) => {
    return new Firestore({ projectId: projectId })
}


const user = {
    deviceDesc: 'Emulator',
    defaultProvider: 'spotify',
    spotifyAccessToken: '{"value": "BQBH3ouuDlLuNKvmibtq1KVagr6eTQ3bEe2FDootkFoBZlsXQc-ACRjp8kMOxLJnp-41feJYWH5GMNE3MIAMCC-ATU3sA90C8UrONydV1Za8y_zD0ekYZLxNumcgdJmHI-XMkcG4dxNbMJadN3mVq9l6IUt3WiVjKshbzMKq_zOnsdNX_w", "timestamp": 1598512936776}',
    displayName: 'Dev User',
    deviceId: 'DE:6C:5D:45:11:DD',
    spotifyRefreshToken: 'AQDmcBFVX3E0zsjejaU9hW1WpiwvcR0hFxDgbDTxnAc6Tua_Ju6bn2e2IPUZYl9lg-TKEdhtnRw4mt4F388MXbWzHv1Ni2VYb1CNeY4zOhudpZI3n40I7EQ8PHvipB367EQ',
    connected: true,
    id: '3BtK1ripPNwYzeekNSYo'
}

test.serial('Token Needs Refresh', async t => {
    const stringField = '{"value": "token-value", "timestamp": 1598512936776}'
    const tokenNeedsRefresh = needsRefresh(JSON.parse(stringField).timestamp, 3600)
    t.is(tokenNeedsRefresh, true);
});

test.serial('Token Does Not Need Refresh', async t => {
    const stringField = `{"value": "token-value", "timestamp": ${Date.now()}}`
    const tokenNeedsRefresh = needsRefresh(JSON.parse(stringField).timestamp, 3600)
    t.is(tokenNeedsRefresh, false);
});

test.serial('Refresh access token', async t => {
    const response = await spotifyRefresh(getDb('aw-dms-demo'), user)
    console.log('RAT RESPONSE >>>> ', response.data)
    t.is(response.status, 200);
});


