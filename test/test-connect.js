const http = require('http');
const test = require('ava');
const request = require('supertest')
const app = require('../dms-server-demo');


test.before(async t => {
	t.context.server = http.createServer(app)
});


test.after.always(t => {
	t.context.server.close();
});

test.serial('Test /connect', async t => {
	const res = await request('http://localhost:8080')
		.get('/connect')
		.set('x-audiowings-deviceid', 'DE:6C:5D:45:11:DD')
	t.is(res.status, 200);
	t.is(res.body.displayName, 'Dev User')
});