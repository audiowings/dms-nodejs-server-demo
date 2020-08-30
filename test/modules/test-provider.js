const test = require('ava');
const Firestore = require('@google-cloud/firestore');

const { getProviderWithDocId } = require('../../provider/provider')

const db = new Firestore(
    {
        projectId: 'aw-dms-demo',
    }
)

test.serial.only('Gets provider with provider id', async t => {
    const provider = await getProviderWithDocId(db, 'spotify')
    console.log(provider)
    t.is(provider.providerName, 'spotify');
});