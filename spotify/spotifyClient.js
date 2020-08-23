
const getAuthUrl =  async (db, providerName) => {
    try {
        const providersRef = db.collection('contentProviders');
        const snapshot = await providersRef.where('providerName', '==', providerName).get();
        if (snapshot.empty) throw `No provider found with name: ${providerName}`
        const provider = snapshot.docs[0].data()
        let authUrl = 'https://accounts.spotify.com/authorize?client_id='
        authUrl += provider.clientId
        authUrl += '&response_type=code&redirect_uri='
        authUrl += provider.redirectUri 
        authUrl += '&scope=playlist-read-private%20playlist-read-collaborative'
        console.log(`authUrl:`, authUrl)

        return authUrl
    } catch (expression) {
        console.log('Error: getUser', expression);
        return { error: expression }
    }
}

exports.startSpotifyAuth = async (db, res, user) => {

    const authUrl = await getAuthUrl(db, user.defaultProvider)
    try{
        res.json({ 
            deviceId: user.deviceId, 
            displayName: user.displayName, 
            contentProvider: user.defaultProvider,
            authUrl: authUrl
        })
    }
    catch(error){
        console.log('Spotify Error:', error)
    }

}

