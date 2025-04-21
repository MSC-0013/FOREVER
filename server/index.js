import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import contactRoutes from './routes/contacts.js';
import userRoutes from './routes/users.js';

// App and server setup
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'https://forever-lovat.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit the process, just log the error
    console.error('Continuing without database connection...');
  }
};

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'https://forever-lovat.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
});

const connectedUsers = new Map(); // userId -> socketId

// Handle socket connection
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);

  connectedUsers.set(socket.userId, socket.id);
  io.emit('online_users', Array.from(connectedUsers.keys()));

  // Messaging
  socket.on('send_message', (data) => {
    const recipientSocketId = connectedUsers.get(data.recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', data);
    }
    socket.emit('new_message', data); // echo to sender
  });

  // Typing indicators
  socket.on('typing', ({ recipientId }) => {
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { userId: socket.userId });
    }
  });

  socket.on('stop_typing', ({ recipientId }) => {
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_stop_typing', { userId: socket.userId });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    io.emit('online_users', Array.from(connectedUsers.keys()));
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('✅ Chat API is running');
});

// Start server
const PORT = process.env.PORT || 5000; // Match the .env PORT
server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
