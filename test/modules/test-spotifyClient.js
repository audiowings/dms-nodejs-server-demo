const test = require('ava');
const rewire = require('rewire')
const { getSpotifyUserPlaylists, getSpotifyUserPlaylist } = require('../../spotify/spotifyClient')

const baseUrl = process.env.npm_package_config_base_url

const mod = rewire('../../spotify/spotifyClient.js')
const getAuthUrl = mod.__get__('getAuthUrl')
const needsRefresh = mod.__get__('needsRefresh')
const spotifyRefresh = mod.__get__('spotifyRefresh')

const getTestUser = () => {
    return {
        deviceDesc: 'Emulator',
        defaultProvider: 'spotify',
        spotifyAccessToken: {
            value: 'BQBT9mp3QjpP4ohlicNPsK1vx4W8KxDb2Q5R7xwMqxLpeYpV41xgIzvLG-Gz9E9-aloieSHkffKnciCX3qVb0WDl-FVGxGiLJ2PqAu2CYRFBzaUQeLAvG5DXRUttW6hdhgxYZt1hshbjlsZeeWy1_I1JL2pxwYh2c6xELMW6gzEtR9YeRmmmiYIF5KGTwRg',
            expiresIn: 3600,
            timestamp: 1598785856080,
            scope: 'playlist-read-private playlist-read-collaborative user-read-email user-read-private',
            tokenType: 'Bearer'
        },
        displayName: 'Dev User',
        deviceId: 'DE:6C:5D:45:11:DD',
        spotifyRefreshToken: 'AQDmcBFVX3E0zsjejaU9hW1WpiwvcR0hFxDgbDTxnAc6Tua_Ju6bn2e2IPUZYl9lg-TKEdhtnRw4mt4F388MXbWzHv1Ni2VYb1CNeY4zOhudpZI3n40I7EQ8PHvipB367EQ',
        connected: true,
        id: '3BtK1ripPNwYzeekNSYo'
    }
}

test.serial('Get Auth URL', async t => {
    const testUser = getTestUser()
    testUser.spotifyAccessToken.timestamp = 1598512936776
    const authUrl = await getAuthUrl(testUser.id)
    // console.log(`authUrl:`, authUrl.toJSON())
    // console.log(`qs:`, authUrl.searchParams.get('redirect_uri'))
    t.is(authUrl.host, 'accounts.spotify.com')
    t.is(authUrl.searchParams.get('redirect_uri'), `${baseUrl}/spotifycallback`)
});


test.serial('Token Needs Refresh', async t => {
    const testUser = getTestUser()
    testUser.spotifyAccessToken.timestamp = 1598512936776
    const tokenNeedsRefresh = needsRefresh(testUser.spotifyAccessToken)
    t.is(tokenNeedsRefresh, true);
});

test.serial('Token Does Not Need Refresh', async t => {
    const testUser = getTestUser()
    testUser.spotifyAccessToken.timestamp = Date.now()
    const tokenNeedsRefresh = needsRefresh(testUser.spotifyAccessToken)
    t.is(tokenNeedsRefresh, false);
});

test.serial('Refresh access token', async t => {
    const testUser = getTestUser()
    const response = await spotifyRefresh(testUser)
    t.is(response.status, 200);
})

test.serial('Get Spotify User Playlists', async t => {
    const testUser = getTestUser()
    const response = await getSpotifyUserPlaylists(testUser)
    t.is(response.status, 200)
    t.assert(response.data.total > 0)
})


test.serial('Get Spotify User Playlist', async t => {
    const testUser = getTestUser()
    const playlistUrl = 'https://api.spotify.com/v1/playlists/1Z2tO3csO2ZB2FcEszUcgr/tracks'
    const response = await getSpotifyUserPlaylist(testUser, playlistUrl)
    // console.log(JSON.stringify(response.data, null, 4))
    t.is(response.status, 200)
    t.assert(response.data.total > 0)
});


