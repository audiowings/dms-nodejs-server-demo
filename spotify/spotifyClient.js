
const baseUrl = process.env.npm_package_config_base_url

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

exports.setSpotifyAuthCode = async (db, res, code, user) => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('deviceId', '==', deviceId).get();
    
    res = await usersRef.set({
        spotifyAuthCode: code
    }, { merge: true });
    console.log('Code', code)
    // TODO: add code to user
}

exports.sendSpotifyAuthPrompt = async (res, user) => {

    res.set('x-spotify-auth-msg', `Visit ${baseUrl}/spotifylogin/${user.id} to access your Spotify content via this device`)
    try {
        res.json({user})
    }
    catch (error) {
        console.log('Spotify Error:', error)
    }
}

exports.spotifyLogin = async (res, userId, db) =>{
    const authUrl = await getAuthUrl(db, userId)
    res.redirect(authUrl);
}

exports.spotifyCallback = (req, res) => {

    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var access_token = body.access_token,
              refresh_token = body.refresh_token;
  
          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });
  
          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  }
  
  exports.spotifyRefresh = (req, res) => {
  
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  }

