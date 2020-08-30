const http = require('http');
const test = require('ava');
const request = require('supertest')
const app = require('../../dms-server-demo');

test.before(async t => {
	t.context.server = http.createServer(app)
});

test.after.always(t => {
	t.context.server.close();
});

test.serial('Test /playlists', async t => {
	const res = await request('http://localhost:8080')
		.get('/playlists')
		.set('x-audiowings-deviceid', 'DE:6C:5D:45:11:DD')
	t.is(res.status, 200);
	t.assert(res.body.total > 0)
});
