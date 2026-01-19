const net = require('net');

const server = net.createServer((socket) => { })

server.on('connection', (socket) => {
    console.log('new connection');

    socket.on('data', (data) => {
        console.log(data.toString('utf-8'));
    })
})

server.listen(3099, '127.0.0.1', () => {
    console.log('opened server on', server.address());
})