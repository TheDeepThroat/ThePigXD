import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// In-memory state
let messages = []; // { id, text, user, timestamp }
let users = {}; // socketId -> username

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlineUsers: Object.keys(users).length });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (username, callback) => {
    // Basic validation
    if (!username || username.trim() === '') {
      return callback({ error: 'Username is required.' });
    }

    const trimmedUsername = username.trim();
    
    // Check if username is already taken by someone currently online
    const isTaken = Object.values(users).some((name) => name.toLowerCase() === trimmedUsername.toLowerCase());
    
    if (isTaken) {
      return callback({ error: 'Username is already taken.' });
    }

    // Register user
    users[socket.id] = trimmedUsername;
    console.log(`${trimmedUsername} joined the chat`);

    // Send chat history to the newly joined user (limit to last 100 for memory safety)
    socket.emit('chatHistory', messages.slice(-100));

    // Broadcast that a user has joined
    socket.broadcast.emit('userJoined', { user: trimmedUsername, timestamp: Date.now() });

    // Send updated user list to everyone else
    socket.broadcast.emit('usersList', Object.values(users));

    callback({ success: true });
  });

  socket.on('requestUsers', () => {
    socket.emit('usersList', Object.values(users));
  });

  // Handle incoming messages
  socket.on('sendMessage', (text, callback) => {
    const user = users[socket.id];
    
    if (!user) {
      return callback({ error: 'Not authenticated.' });
    }

    if (!text || text.trim() === '') {
      return callback({ error: 'Message cannot be empty.' });
    }

    const message = {
      id: crypto.randomUUID(),
      user,
      text: text.trim(),
      timestamp: Date.now(),
    };

    messages.push(message);

    // Keep memory in check, let's store only the last 1000 messages
    if (messages.length > 1000) {
      messages = messages.slice(messages.length - 1000);
    }

    // Broadcast message to everyone
    io.emit('newMessage', message);
    
    if (callback) callback({ success: true });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    
    if (username) {
      console.log(`${username} disconnected`);
      delete users[socket.id];
      
      // Broadcast user left
      io.emit('userLeft', { user: username, timestamp: Date.now() });
      
      // Update user list
      io.emit('usersList', Object.values(users));
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
