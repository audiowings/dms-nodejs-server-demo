const test = require('ava');
const { getUserWithDocId, getUserWithDeviceId, getProviderWithDocId } = require('../../database/database')


test.serial('Gets provider with provider id', async t => {
    const provider = await getProviderWithDocId('spotify')
    console.log('provider', provider)
    t.is(provider.providerName, 'spotify');
});

test.serial('Gets user with user id', async t => {
    const user = await getUserWithDocId('3BtK1ripPNwYzeekNSYo')
    console.log(user)
    t.is(user.displayName, 'Dev User');
})

test.serial('Gets user with device id', async t => {
    const user = await getUserWithDeviceId('DE:6C:5D:45:11:DD')
    console.log(user)
    t.is(user.displayName, 'Dev User');
});