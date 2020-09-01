const getPort = require('get-port');

exports.getServer = async () => {
    const port = await getPort()
    process.env.PORT = port
    const app = require('../../dms-server-demo')
    return {
        app: app,
        baseUrl: process.env.npm_package_config_base_url,
        port: port
    }
} 