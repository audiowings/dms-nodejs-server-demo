const Firestore = require('@google-cloud/firestore');
const projectId = 'aw-dms-demo'

exports.getDb = (projectId) => {
    return new Firestore({ projectId: projectId })
}

exports.db = this.getDb(projectId)

exports.getProviderWithDocId = async (providerName) => {
    try {
        const providerRef = this.db.collection('contentProviders').doc(providerName);
        const providerDoc = await providerRef.get()
        return providerDoc.data()
    } catch (expression) {
        console.log('Error: getProviderWithDocId', expression);
        return { error: expression }
    }
}

exports.getUserWithDocId = async (docId) => {
    try {
        const userRef = this.db.collection('users').doc(docId);
        const userDoc = await userRef.get()
        return userDoc.data()
    } catch (expression) {
        console.log('Error: getUserWithDocId', expression);
        return { error: expression }
    }
}

exports.getUserWithDeviceId = async (deviceId) => {
    try {
        const usersRef = this.db.collection('users');
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