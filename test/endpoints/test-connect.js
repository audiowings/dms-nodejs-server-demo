const http = require('http');
const test = require('ava');
const request = require('supertest')
const { getServer } = require('../utils/server')

test.before(async t => {
	const server = await getServer()
	t.context.server = http.createServer(server.app)
	t.context.prefixUrl = `${server.baseUrl}:${server.port}`
})

test.after.always(t => {
	t.context.server.close();
});

test.serial('Test /connect', async t => {
	const res = await request(t.context.prefixUrl)
		.get('/connect')
		.set('x-audiowings-deviceid', 'DE:6C:5D:45:11:DD')
	// console.log('HEADERSD', res)
	t.is(res.status, 200);
	t.is(res.body.displayName, 'Dev User')
});