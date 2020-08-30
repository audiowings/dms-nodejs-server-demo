
exports.getUserWithDocId = async (db, docId) => {
    try {
        const userRef = db.collection('users').doc(docId);
        const userDoc = await userRef.get()
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
        user.id = snapshot.docs[0].id
        return user
    } catch (expression) {
        console.log('Error: getUserWithDeviceId', expression);
        return { error: expression }
    }
}
