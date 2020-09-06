
const request = require('request')
const axios = require('axios').default;
const qs = require('qs')

const { db, getUserWithDocId, getProviderWithDocId } = require('../database/database')

const baseUrl = process.env.npm_package_config_base_url

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';
const awUserKey = 'aw_user_id';

const getAuthUrl = async (userId) => {
  try {

    const provider = await getProviderWithDocId('spotify')
    const user = await getUserWithDocId(userId)

    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.append('client_id', provider.clientId)
    authUrl.searchParams.append('response_type', provider.responseType)
    authUrl.searchParams.append('redirect_uri', `${baseUrl}${provider.redirectUriPath}`)
    authUrl.searchParams.append('scope', provider.scope)
    authUrl.searchParams.append('deviceId', user.deviceId)
    return authUrl
  } catch (expression) {
    console.log('Error: getAuthUrl', expression);
    return { error: expression }
  }
}

exports.getSpotifyAuthPromptData = (user) => {

  const headers = {
    'x-spotify-auth-msg': `Visit ${baseUrl}/spotifylogin/${user.id} in a browser to allow this device to access your Spotify account`
  }
  return { headers: headers}
}

exports.spotifyLogin = async (res, userId) => {
  const authUrl = await getAuthUrl(userId)
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.cookie(awUserKey, userId);

  authUrl.searchParams.append('state', state)

  res.redirect(authUrl);
}

exports.getSpotifyLoginData = async (userId) => {

  const authUrl = await getAuthUrl(db, userId)
  const state = generateRandomString(16);

  authUrl.searchParams.append('state', state)

  const cookieData = {}
  cookieData[stateKey] = state
  cookieData[awUserKey] = userId

  return { authUrl: authUrl, cookies: cookieData }
}

const updateTokens = async (awUserId, tokenData) => {
  try {
    const userRef = db.collection('users').doc(awUserId);
    // Set user token values

    tokenData.refresh_token && await userRef.update({
      spotifyRefreshToken: tokenData.refresh_token
    })
    const spotifyAccessToken = {
      "timestamp": Date.now(),
      "value": tokenData.access_token,
      "tokenType": tokenData.token_type,
      "expiresIn": tokenData.expires_in,
      "scope": tokenData.scope
    }
    return await userRef.update({
      spotifyAccessToken: spotifyAccessToken
    })
  }
  catch (expression) {
    console.log('Error updating user tokens:', expression);
    return { error: expression }
  }
}


exports.spotifyCallback = async (req, res) => {

  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;
  const awUserId = req.cookies ? req.cookies[awUserKey] : null;

  if (state === null || state !== storedState) {
    const url = new URL(`${baseUrl}/#`)
    url.searchParams.append('error', 'state_mismatch')
    res.redirect(url);
  } else {

    const provider = await getProviderWithDocId('spotify')

    res.clearCookie(stateKey);
    res.clearCookie(awUserKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: `${baseUrl}${provider.redirectUriPath}`,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + provider.encodedAuth
      },
      json: true
    };

    // Request tokens
    request.post(authOptions, async (error, response, body) => {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      if (!error && response.statusCode === 200) {
        updateTokens(awUserId, body)
      } else {
        res.redirect(`${baseUrl}/#` +
          qs.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
}

const spotifyRefresh = async (user) => {
  const provider = await getProviderWithDocId('spotify')

  //Get refresh token from db
  //Create and send refresh token request
  try {
    const url = 'https://accounts.spotify.com/api/token'
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + provider.encodedAuth
      },
      data: qs.stringify({
        'grant_type': 'refresh_token',
        'refresh_token': user.spotifyRefreshToken
      })
    }
    const resp = await axios(url, options)
    return resp
  } catch (error) {
    console.error('Error:', error);
  }
}

const needsRefresh = (accessToken) => {
  return Date.now() - accessToken.timestamp >= (accessToken.expiresIn * 1000)
}

exports.getSpotifyUserPlaylists = async (user) => {
  let accessToken = user.spotifyAccessToken.value

  if (needsRefresh(user.spotifyAccessToken)) {
    const response = await spotifyRefresh(user)
    accessToken = response.data.access_token
    await updateTokens(user.id, response.data)
  }

  try {
    const url = 'https://api.spotify.com/v1/me/playlists'
    const options = {
      method: 'GET',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + accessToken
      }
    }

    const playlistsResponse = await axios(url, options)
    return playlistsResponse
  } catch (error) {
    console.error('Error /me/playlists:', error.request.res.headers)
  }
}


exports.getSpotifyUserPlaylist = async (user, playlistUrl) => {
  let accessToken = user.spotifyAccessToken.value

  if (needsRefresh(user.spotifyAccessToken)) {
    const response = await spotifyRefresh(user)
    accessToken = response.data.access_token
    await updateTokens(user.id, response.data)
  }

  try {
    const url = playlistUrl
    const options = {
      method: 'GET',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + accessToken
      },
      params: {
        fields: 'items(track(name,href,external_urls,preview_url,artists(name),album(name))),total'
      }
    }

    const playlistResponse = await axios(url, options)
    return playlistResponse
  } catch (error) {
    console.error('Error /me/playlist:', error.request.res.headers)
  }
}