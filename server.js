const http = require('http');
const app = require('./src/app');
const server = http.createServer(app);

const port = process.env.PORT || 8080;
server.listen(port,() => {
    console.log('server is listening on http://localhost:'+ port);
})