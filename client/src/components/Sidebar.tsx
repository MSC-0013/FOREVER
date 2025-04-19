// Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogOut, MessageCircle } from 'lucide-react';
import UserSearch from './UserSearch';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { contacts, fetchContacts, activeContact, setActiveContact } = useChat();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleContactClick = (contact: { _id: string; username: string }) => {
    setActiveContact(contact);
    navigate(`/chat/user/${contact._id}`);
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r flex flex-col h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-indigo-100 to-white shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-indigo-600" />
          <span className="text-xl font-bold text-gray-800">Forever</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSearchOpen(true)} aria-label="Add user">
            <UserPlus className="text-gray-600 hover:text-indigo-600" />
          </button>
          <button onClick={() => setIsLogoutModalOpen(true)} aria-label="Logout">
            <LogOut className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-2">
        <p className="text-xs text-gray-500 uppercase px-2 mt-3 mb-2">Recent Chats</p>
        {contacts.length === 0 ? (
          <div className="text-sm text-gray-500 px-4">No contacts. Start a new chat!</div>
        ) : (
          <ul className="space-y-2">
            {contacts.map(contact => {
              const isOnline = onlineUsers.includes(contact._id);
              const isActive = activeContact?._id === contact._id;

              return (
                <li
                  key={contact._id}
                  onClick={() => handleContactClick(contact)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    isActive ? 'bg-indigo-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                      {contact.username[0].toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{contact.username}</p>
                    <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modals */}
      {isSearchOpen && <UserSearch onClose={() => setIsSearchOpen(false)} />}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm text-center space-y-4">
            <h2 className="text-lg font-semibold">Confirm Logout?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  onLogout();
                  setIsLogoutModalOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
              <button onClick={() => setIsLogoutModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
