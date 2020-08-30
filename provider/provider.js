exports.getProviderWithDocId = async (db, providerName) => {
    try {
        const providerRef = db.collection('contentProviders').doc(providerName);
        const providerDoc = await providerRef.get()
        return providerDoc.data()
    } catch (expression) {
        console.log('Error: getProviderWithDocId', expression);
        return { error: expression }
    }
}