import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import EmptyChat from '../components/EmptyChat';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext'; // Import the useTheme hook
import { Moon, Sun } from 'lucide-react'; // Import moon and sun icons for dark/light mode toggle

const ChatPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); // Get theme and toggleTheme function

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    document.title = 'FOREVER';
  }, []);

  return (
    <ChatProvider>
      <div className={`flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
        <div className="w-full flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <Sidebar onLogout={handleLogout} />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950 shadow-inner rounded-tl-2xl md:rounded-none transition-all duration-300">
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
