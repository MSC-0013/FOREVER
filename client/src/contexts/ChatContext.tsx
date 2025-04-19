import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  username: string;
}

interface ChatContextType {
  contacts: Contact[];
  messages: Record<string, Message[]>;
  activeContact: Contact | null;
  loadingMessages: boolean;
  loadingContacts: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  fetchMessages: (contactId: string) => Promise<void>;
  sendMessage: (content: string, recipientId: string) => Promise<void>;
  setActiveContact: (contact: Contact | null) => void;
  addContact: (userId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        setMessages(prevMessages => {
          const contactId = message.sender === user?.id ? message.recipient : message.sender;
          const contactMessages = prevMessages[contactId] || [];
          return {
            ...prevMessages,
            [contactId]: [...contactMessages, message]
          };
        });
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket, user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoadingContacts(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/contacts');
      setContacts(response.data);
    } catch (error) {
      setError('Failed to fetch contacts');
      console.error(error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;
    
    try {
      setLoadingMessages(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/messages/${contactId}`);
      setMessages(prev => ({
        ...prev,
        [contactId]: response.data
      }));
    } catch (error) {
      setError('Failed to fetch messages');
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (content: string, recipientId: string) => {
    if (!user || !socket) return;
    
    try {
      const response = await axios.post('http://localhost:5000/api/messages', {
        content,
        recipientId
      });
      
      const newMessage = response.data;
      
      // Update local messages
      setMessages(prev => {
        const contactMessages = prev[recipientId] || [];
        return {
          ...prev,
          [recipientId]: [...contactMessages, newMessage]
        };
      });
      
      // Emit the message via socket
      socket.emit('send_message', newMessage);
    } catch (error) {
      setError('Failed to send message');
      console.error(error);
    }
  };

  const addContact = async (userId: string) => {
    if (!user) return;
    
    try {
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/contacts', {
        contactId: userId
      });
      
      // Add the new contact to the list
      setContacts(prev => [...prev, response.data]);
    } catch (error) {
      setError('Failed to add contact');
      console.error(error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        contacts,
        messages,
        activeContact,
        loadingMessages,
        loadingContacts,
        error,
        fetchContacts,
        fetchMessages,
        sendMessage,
        setActiveContact,
        addContact
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};