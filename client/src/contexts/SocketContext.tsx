import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Record<string, boolean>;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const backendURL = process.env.REACT_APP_BACKEND_URL ;

    // Initialize socket connection
    const newSocket = io(backendURL, {
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    // Event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_typing', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: true }));
    });

    newSocket.on('user_stop_typing', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: false }));
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const startTyping = (recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', { recipientId });
    }
  };

  const stopTyping = (recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', { recipientId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
