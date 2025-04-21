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
    if (!socket || !user) return;

    const handleNewMessage = (message: Message) => {
      const contactId = message.sender === user?.id ? message.recipient : message.sender;
      setMessages(prevMessages => {
        const contactMessages = prevMessages[contactId] || [];
        return {
          ...prevMessages,
          [contactId]: [...contactMessages, message],
        };
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, user]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setLoadingContacts(true);
      setError(null);
      const response = await axios.get<Contact[]>('/api/contacts');
      setContacts(response.data);
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;

    try {
      setLoadingMessages(true);
      setError(null);
      const response = await axios.get<Message[]>(`/api/messages/${contactId}`);
      setMessages(prev => ({
        ...prev,
        [contactId]: response.data,
      }));
    } catch (err) {
      setError('Failed to fetch messages');
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (content: string, recipientId: string) => {
    if (!user || !socket) return;

    try {
      const response = await axios.post<Message>('/api/messages', {
        content,
        recipientId,
      });

      const newMessage = response.data;

      setMessages(prev => {
        const contactMessages = prev[recipientId] || [];
        return {
          ...prev,
          [recipientId]: [...contactMessages, newMessage],
        };
      });

      socket.emit('send_message', newMessage);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const addContact = async (userId: string) => {
    if (!user) return;

    try {
      setError(null);
      const response = await axios.post<Contact>('/api/contacts', {
        contactId: userId,
      });

      setContacts(prev => [...prev, response.data]);
    } catch (err) {
      setError('Failed to add contact');
      console.error(err);
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
        addContact,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
