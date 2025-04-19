# 💬 Real-Time Chat Application

A full-stack real-time chat application built with **React**, **Express**, **MongoDB**, and **Socket.IO**. This application enables users to chat in real-time, manage contacts, and persist chat history. It includes user authentication, typing indicators, and online/offline status management.

---

## 🚀 Features

- **User authentication** using JSON Web Tokens (JWT)
- **Real-time messaging** with Socket.IO
- **User search** and **contact management**
- **Online/offline status** indicators for active users
- **Typing indicators** to show when a user is typing
- **Chat history persistence** with MongoDB
- **Responsive design** using Tailwind CSS

---

## 📁 Project Structure

├── /src # React client │ ├── /components # UI components │ ├── /contexts # React context providers │ ├── /pages # Page components │ └── /utils # Utility functions │ ├── /server # Express server │ ├── /middleware # Express middleware │ ├── /models # Mongoose models │ ├── /routes # API routes │ └── index.js # Server entry point

yaml
Copy
Edit

---

## 🔧 Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js** (v14 or later)
- **MongoDB** (local or MongoDB Atlas)

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2. Install dependencies
Install dependencies for both client and server:

bash
Copy
Edit
npm install                  # Install client dependencies
cd server && npm install     # Install server dependencies
3. Configure environment variables
Copy the .env.example file to .env in both the root and server directories.

Add the following environment variables:

JWT_SECRET: Secret key for JWT authentication.

MONGO_URI: URI for MongoDB connection (can be local or MongoDB Atlas).

4. Run the development environment
bash
Copy
Edit
npm run dev                  # Start both the client and server concurrently
The application will be accessible at http://localhost:3000 for the frontend, and the server will run on http://localhost:5000.

🌐 Running in Production
1. Build the client
bash
Copy
Edit
npm run build
2. Start the server in production mode
bash
Copy
Edit
cd server && npm start       # Start the backend server
Now the app should be running in production mode. You can host the backend on a platform like Heroku, DigitalOcean, or AWS, and the frontend on platforms like Netlify, Vercel, or any static hosting service.

🔌 API Endpoints
🧾 Authentication
POST /api/auth/register: Register a new user.

Request body:

json
Copy
Edit
{
  "username": "user123",
  "password": "password"
}
POST /api/auth/login: Login user.

Request body:

json
Copy
Edit
{
  "username": "user123",
  "password": "password"
}
💬 Messages
GET /api/messages/:userId: Get chat history with a specific user.

Example URL: /api/messages/605c72ef153207001f49d8a

POST /api/messages: Send a message.

Request body:

json
Copy
Edit
{
  "receiverId": "605c72ef153207001f49d8a",
  "content": "Hello, how are you?"
}
👥 Contacts
GET /api/contacts: Get user's contacts.

POST /api/contacts: Add a new contact.

Request body:

json
Copy
Edit
{
  "contactId": "605c72ef153207001f49d8a"
}
🔍 Users
GET /api/users/search: Search for users by username.

Query parameters:

bash
Copy
Edit
/api/users/search?username=user123
📡 Socket.IO Events
🔼 Client Emits
send_message: Send a new message.

Data: { receiverId, content }

typing: Notify when the user starts typing.

Data: { userId, username }

stop_typing: Notify when the user stops typing.

Data: { userId, username }

🔽 Server Emits
new_message: Broadcast a new message to other clients.

Data: { senderId, receiverId, content }

online_users: Update the list of online users.

Data: { onlineUsers: [userIds] }

user_typing: Broadcast when a user is typing.

Data: { username }

user_stop_typing: Broadcast when a user stops typing.

Data: { username }

📝 License
This project is licensed under the MIT License.
Feel free to fork and contribute!

✨ Author
Developed with ❤️ by Your Name

yaml
Copy
Edit

---

This `README.md` provides detailed information about setting up, running, and using the **Real-Time Chat Applic
