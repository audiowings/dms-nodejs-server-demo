
const request = require('request')
const querystring = require('querystring')

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

const getAuthUrl = async (db, userId) => {
  try {
    const providerRef = db.collection('contentProviders').doc('spotify');
    const providerDoc = await providerRef.get()
    const provider = providerDoc.data()

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get()
    const user = userDoc.data()

    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.append('client_id', provider.clientId)
    authUrl.searchParams.append('response_type', provider.responseType)
    authUrl.searchParams.append('redirect_uri', `${baseUrl}${provider.redirectUriPath}`)
    authUrl.searchParams.append('scope', provider.scope)
    authUrl.searchParams.append('deviceId', user.deviceId)

    console.log(`authUrl:`, authUrl.toString())

    return authUrl
  } catch (expression) {
    console.log('Error: getAuthUrl', expression);
    return { error: expression }
  }
}

exports.spotifyLogin = async (res, userId, db) => {
  const authUrl = await getAuthUrl(db, userId)
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.cookie(awUserKey, userId);

  authUrl.searchParams.append('state', state)

  res.redirect(authUrl);
}


exports.sendSpotifyAuthPrompt = async (res, user) => {

  res.set('x-spotify-auth-msg', `Visit ${baseUrl}/spotifylogin/${user.id} to access your Spotify content via this device`)
  try {
    res.json({ user })
  }
  catch (error) {
    console.log('Spotify Error:', error)
  }
}



exports.spotifyCallback = async (req, res, db) => {

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
    let provider
    try {
      const providerRef = db.collection('contentProviders').doc('spotify');
      const providerDoc = await providerRef.get()
      provider = providerDoc.data()
    } catch (expression) {
      console.log('Error getting provider', expression);
      return { error: expression }
    }
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
      if (!error && response.statusCode === 200) {

        const access_token = body.access_token
        const refresh_token = body.refresh_token

        try {
          const userRef = db.collection('users').doc(awUserId);
          // Set the 'capital' field of the city
          const res = await userRef.update({
            spotifyAccessToken: access_token,
            spotifyRefreshToken: refresh_token
          })
        }
        catch (expression) {
          console.log('Error updating user tokens:', expression);
          return { error: expression }
        }

      } else {
        res.redirect(`${baseUrl}/#` +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
}

exports.spotifyRefresh = (req, res) => {

  // requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
}

