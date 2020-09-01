const http = require('http');
const test = require('ava');
const request = require('supertest')
const { getServer } = require('../utils/server')
const baseUrl = process.env.npm_package_config_base_url

test.before(async t => {
    const server = await getServer()
    t.context.server = http.createServer(server.app)
    t.context.prefixUrl = `${server.baseUrl}:${server.port}`
})

test.after.always(t => {
    t.context.server.close();
});

test.serial('Test /spotifycallback', async t => {
    const res = await request(t.context.prefixUrl)
        .get('/spotifycallback/3BtK1ripPNwYzeekNSYo')
    const url = new URL(res.headers.location)
    t.is(res.status, 302)
    t.is(url.host, `accounts.spotify.com`)
    t.is(url.pathname, `/authorize`)
    t.is(url.searchParams.get('redirect_uri'), `${baseUrl}/spotifycallback`)

})