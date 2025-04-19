import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import EmptyChat from '../components/EmptyChat';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Set the page title
    document.title = 'ChatConnect';
  }, []);

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <div className="w-full flex flex-col md:flex-row">
          {/* Header for mobile only */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">ChatConnect</h1>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Sidebar */}
          <Sidebar onLogout={handleLogout} />

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Routes>
              <Route path="/" element={<EmptyChat />} />
              <Route path="/user/:userId" element={<ChatWindow />} />
            </Routes>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;