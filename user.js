
exports.getUserWithDocId = async (db, docId) => {
    try {
        const userRef = db.collection('users').doc(docId);
        const userDoc = await userRef.get()
        console.log('userDoc.data()', userDoc.data())
        return userDoc.data()
    } catch (expression) {
        console.log('Error: getUserWithDocId', expression);
        return { error: expression }
    }
}

exports.getUserWithDeviceId = async (db, deviceId) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('deviceId', '==', deviceId).get();
        if (snapshot.empty) throw `No user found with deviceId: ${deviceId}`
        const user = snapshot.docs[0].data()
        console.log('\nsnapshot.docs[0].data()', JSON.parse(snapshot.docs[0].data().spotifyAccessToken).timestamp)

        user.id = snapshot.docs[0].id
        console.log(`Matched deviceId: ${deviceId} to user: ${user.displayName}`)
        return user
    } catch (expression) {
        console.log('Error: getUserWithDeviceId', expression);
        return { error: expression }
    }
}
