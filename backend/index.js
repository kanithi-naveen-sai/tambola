const http = require('http');
const app = require('./server/app');
const { Server } = require('socket.io');
const socketHandler = require('./socket/socketHandler');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bind socket handlers
socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
