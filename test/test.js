const http = require('http');
const test = require('ava');
const got = require('got');
const listen = require('test-listen');
const app = require('../dms-server-demo');


test.before(async t => {
	t.context.server = http.createServer(app);
	t.context.prefixUrl = await listen(t.context.server);
	console.log('\nt.context.prefixUrl', t.context.prefixUrl)

});



test.after.always(t => {
	t.context.server.close();
});

test.serial('get /connect', async t => {
	console.log(t.context.prefixUrl)
	const {user} = await got('connect', {
		prefixUrl: 'http://localhost:8080',
		headers: {
			'x-audiowings-deviceid': 'DE:6C:5D:45:11:DD'
		}
	})
	console.log(user);
	t.is(user, '"displayName":"Dev User"');
});