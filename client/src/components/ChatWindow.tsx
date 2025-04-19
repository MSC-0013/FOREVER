import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useChat } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

const ChatWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { messages, fetchMessages, sendMessage, contacts, setActiveContact } = useChat();
  const { user } = useAuth();
  const { onlineUsers, typingUsers, startTyping, stopTyping } = useSocket();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false); // Added state to prevent duplicate sends
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentContact = contacts.find(contact => contact._id === userId);

  useEffect(() => {
    if (userId) fetchMessages(userId);
  }, [userId]);

  useEffect(() => {
    if (currentContact) setActiveContact(currentContact);
  }, [currentContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userId]);

  useEffect(() => {
    if (userId) setIsTyping(Boolean(typingUsers[userId]));
  }, [typingUsers, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || isSending) return; // Prevent sending while already sending

    setIsSending(true); // Set sending to true to prevent further sends

    sendMessage(newMessage.trim(), userId);
    setNewMessage(''); // Clear input after sending

    // Ensure that the typing state is cleared after sending
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(userId);

    setIsSending(false); // Reset sending state after message is sent
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    if (userId && value) {
      startTyping(userId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(userId), 3000);
    } else if (userId && !value) {
      stopTyping(userId);
    }
  };

  const isUserOnline = userId ? onlineUsers.includes(userId) : false;
  const chatMessages: Message[] = userId ? messages[userId] || [] : [];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 flex items-center border-b bg-white shadow-lg sticky top-0 z-10"
      >
        {currentContact ? (
          <>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                {currentContact.username.charAt(0).toUpperCase()}
              </div>
              {isUserOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full ring-2 ring-white animate-ping" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">{currentContact.username}</p>
              <p className="text-sm text-gray-600">{isUserOnline ? 'Online' : 'Offline'}</p>
            </div>
          </>
        ) : (
          <div className="h-10 w-40 bg-gray-300 animate-pulse rounded" />
        )}
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((message, index) => (
          <motion.div
            key={`${message._id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-5 py-3 rounded-xl shadow-lg text-sm transition-all ${
                message.sender === user?.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">{format(new Date(message.createdAt), 'h:mm a')}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-200 px-4 py-2 rounded-xl max-w-[120px] flex items-center space-x-1 animate-pulse">
              <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 flex items-center border-t bg-white shadow-inner gap-4"
      >
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-5 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.1 }}
          className="p-3 text-blue-600 hover:text-blue-700 transition-all"
        >
          <Send size={22} />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatWindow;
