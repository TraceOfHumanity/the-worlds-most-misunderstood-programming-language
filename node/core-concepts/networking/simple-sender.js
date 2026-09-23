const net = require('net');

const socket = net.createConnection({ port: 3099, host: '127.0.0.1' }, () => {
    const buffer = Buffer.alloc(2)
    buffer[0] = 0x48;
    buffer[1] = 0x69;
    socket.write(buffer);
})