import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const {
  MONGO_URI,
  PORT = 5000,
  JWT_SECRET,
  CLIENT_URL
} = process.env;

// Import routes
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import contactRoutes from './routes/contacts.js';
import userRoutes from './routes/users.js';

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Authenticate socket with JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Track connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  connectedUsers.set(socket.userId, socket.id);
  io.emit('online_users', Array.from(connectedUsers.keys()));

  socket.on('send_message', (messageData) => {
    const recipientSocketId = connectedUsers.get(messageData.recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', messageData);
    }
    socket.emit('new_message', messageData);
  });

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

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    io.emit('online_users', Array.from(connectedUsers.keys()));
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Chat API is running');
});

// Start the server
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
