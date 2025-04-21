import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import contactRoutes from './routes/contacts.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000', // Adjust this to your client URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5000', 
    methods: ['GET', 'POST']
  }
});

// Socket middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Connected users
const connectedUsers = new Map();

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Add user to connected users
  connectedUsers.set(socket.userId, socket.id);
  
  // Broadcast online users
  io.emit('online_users', Array.from(connectedUsers.keys()));

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    const recipientSocketId = connectedUsers.get(messageData.recipient);
    
    if (recipientSocketId) {
      // Send to recipient
      io.to(recipientSocketId).emit('new_message', messageData);
    }
    
    // Also send back to sender to ensure delivery
    socket.emit('new_message', messageData);
  });

  // Handle typing indicators
  socket.on('typing', ({ recipientId }) => {
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', {
        userId: socket.userId
      });
    }
  });

  socket.on('stop_typing', ({ recipientId }) => {
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_stop_typing', {
        userId: socket.userId
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove user from connected users
    connectedUsers.delete(socket.userId);
    
    // Broadcast online users
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
  res.send('Chat API is running');
});

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
