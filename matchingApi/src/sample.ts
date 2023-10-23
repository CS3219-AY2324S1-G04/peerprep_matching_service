import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

io.on('connection', (socket) => {
  const cookies = socket.request.headers.cookie;
  if (cookies) {
    const cookieArray = cookies.split(';');
    const sessionTokenCookie = cookieArray.find((cookie) =>
      cookie.trim().startsWith('session-token='),
    );

    if (sessionTokenCookie) {
      const sessionTokenValue = sessionTokenCookie.split('=')[1];
      // Now you have the session token value
      console.log('Session Token:', sessionTokenValue);
      socket.join(sessionTokenValue); // Join the specified room
    }
  }

  // Handle room joining
  socket.on('joinRoom', (room) => {
    console.log('joined room');
    socket.join(room); // Join the specified room
  });

  // Handle messages in rooms
  socket.on('messageToRoom', (room, message) => {
    io.to(room).emit('message', message); // Broadcast the message to all sockets in the room
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});

app.get('/:room', async (req, res) => {
  const room = req.params.room;
  io.to(room).emit('success', 'FLYING FISH');
  res.send(`Message sent to room: ${room}`);
});
