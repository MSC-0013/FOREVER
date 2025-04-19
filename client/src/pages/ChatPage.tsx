import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import EmptyChat from '../components/EmptyChat';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'FOREVER';
  }, []);

  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ChatProvider>
      <div className={`relative min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>

        

        {/* Sidebar */}
        <div className="w-full md:w-1/4 lg:w-1/4 border-b md:border-r md:border-b-0 border-gray-200 dark:border-gray-700">
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<EmptyChat />} />
            <Route path="/user/:userId" element={<ChatWindow />} />
          </Routes>
        </div>
        
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
