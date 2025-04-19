# Real-Time Chat Application

A full-stack real-time chat application built with React, Express, MongoDB, and Socket.IO.

## Features

- User authentication with JWT
- Real-time messaging with Socket.IO
- User search and contact management
- Online/offline status indicators
- Typing indicators
- Chat history persistence with MongoDB
- Responsive design with Tailwind CSS

## Project Structure

```
├── /src                 # React client 
│   ├── /components      # UI components
│   ├── /contexts        # React context providers
│   ├── /pages           # Page components
│   └── /utils           # Utility functions
│
├── /server              # Express server
│   ├── /middleware      # Express middleware
│   ├── /models          # Mongoose models
│   ├── /routes          # API routes
│   └── index.js         # Server entry point
```

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

## Setup Instructions

1. Clone the repository

2. Install dependencies
   ```bash
   npm install          # Install client dependencies
   cd server && npm install   # Install server dependencies
   ```

3. Environment Variables
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the variables as needed

4. Start the development servers
   ```bash
   npm run dev          # Start both client and server
   ```

## Running in Production

1. Build the client
   ```bash
   npm run build
   ```

2. Start the server
   ```bash
   cd server && npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user

### Messages
- `GET /api/messages/:userId` - Get chat history with a specific user
- `POST /api/messages` - Send a message

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Add a new contact

### Users
- `GET /api/users/search` - Search for users by username

## Socket.IO Events

### Client Emits
- `send_message` - Send a new message
- `typing` - Notify when user starts typing
- `stop_typing` - Notify when user stops typing

### Server Emits
- `new_message` - Broadcast new messages
- `online_users` - Update online users list
- `user_typing` - Broadcast typing status
- `user_stop_typing` - Broadcast stopped typing status

## License

MIT