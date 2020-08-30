const test = require('ava');
const Firestore = require('@google-cloud/firestore');

const { getUserWithDocId, getUserWithDeviceId } = require('../user/user')

const db = new Firestore(
    {
        projectId: 'aw-dms-demo',
    }
)

test.serial('Gets user with user id', async t => {
    const user = await getUserWithDocId(db, '3BtK1ripPNwYzeekNSYo')
    console.log(user)
    t.is(user.displayName, 'Dev User');
})

test.serial('Gets user with device id', async t => {
    const user = await getUserWithDeviceId(db, 'DE:6C:5D:45:11:DD')
    console.log(user)
    t.is(user.displayName, 'Dev User');
});