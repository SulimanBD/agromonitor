// server.js for custom server with Next.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Create an HTTP server to handle both HTTP and WebSocket
    const httpServer = http.createServer(server);
    const io = socketIo(httpServer);

    // WebSocket connection setup
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    // All other requests are handled by Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Start the server
    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
