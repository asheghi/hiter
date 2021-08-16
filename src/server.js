const http = require('http');
const getApp = require('./app');
const getPort = require('get-port');

module.exports = async ({port, hostname = '127.0.0.1', noAuth, username, password}) => {
    if (!port) {
        port = await getPort({port: getPort.makeRange(3000,4000)});
    }
    const server = http.createServer(getApp({noAuth,username,password}));
    server.listen(port, hostname,() => {
        console.log(`server is listening on http://${hostname}:${port}`);
    })
}
