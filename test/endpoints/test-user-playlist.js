const http = require('http');
const test = require('ava');
const request = require('supertest')
const { getServer } = require('../utils/server')

test.before(async t => {
	const server = 'https://aw-dms-demo.nw.r.appspot.com' //await getServer()
	// const server = await getServer()
	t.context.server = http.createServer(server.app)
	t.context.prefixUrl = 'https://aw-dms-demo.nw.r.appspot.com'
	// t.context.prefixUrl = `${server.baseUrl}:${server.port}`
})

test.after.always(t => {
	t.context.server.close();
});

test.serial('Test /playlist', async t => {
	const res = await request(t.context.prefixUrl)
		.get('/playlist')
		.set('x-audiowings-deviceid', 'DE:6C:5D:45:11:DD')
		.set('x-audiowings-playlist-url', 'https://api.spotify.com/v1/playlists/1Z2tO3csO2ZB2FcEszUcgr/tracks')
	// console.log(JSON.stringify(res.body, null, 4))
	t.is(res.status, 200)
	t.assert(res.body.total > 0)
})
