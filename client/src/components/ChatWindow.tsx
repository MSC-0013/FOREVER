import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useChat } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';

const ChatWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { messages, fetchMessages, sendMessage, contacts, setActiveContact } = useChat();
  const { user } = useAuth();
  const { onlineUsers, typingUsers, startTyping, stopTyping } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find the current contact
  const currentContact = contacts.find(contact => contact._id === userId);
  
  useEffect(() => {
    if (userId && currentContact) {
      fetchMessages(userId);
      setActiveContact(currentContact);
    }
  }, [userId, currentContact, fetchMessages, setActiveContact]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userId]);

  useEffect(() => {
    // Check if the other user is typing
    if (userId) {
      setIsTyping(!!typingUsers[userId]);
    }
  }, [typingUsers, userId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() && userId) {
      sendMessage(newMessage.trim(), userId);
      setNewMessage('');
      
      // Clear any typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Also send stop typing event
      stopTyping(userId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing event
    if (userId && e.target.value) {
      startTyping(userId);
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a new timeout to stop typing event
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(userId);
      }, 3000);
    } else if (userId && !e.target.value) {
      stopTyping(userId);
    }
  };

  // Check if user is online
  const isUserOnline = userId ? onlineUsers.includes(userId) : false;

  // Get messages for the current chat
  const chatMessages = userId ? messages[userId] || [] : [];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        {currentContact ? (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {currentContact.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {isUserOnline && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentContact.username}</p>
              <p className="text-xs text-gray-500">
                {isUserOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === user?.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === user?.id ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-lg shadow rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;