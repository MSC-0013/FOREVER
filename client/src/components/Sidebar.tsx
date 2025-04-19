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
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactClick = (contact: { _id: string; username: string }) => {
    setActiveContact(contact);
    navigate(`/chat/user/${contact._id}`);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  const handleLogoutConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      onLogout();
    }
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="text-blue-600" size={28} />
          <h1 className="text-2xl font-semibold text-gray-800">FOREVER</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            aria-label="Search users"
          >
            <UserPlus size={24} className="text-gray-600 hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 md:flex hidden"
            aria-label="Logout"
          >
            <LogOut size={24} className="text-gray-600 hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-2">Recent Chats</h2>
        {contacts.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">No contacts yet. Add someone to chat!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <li
                key={contact._id}
                onClick={() => handleContactClick(contact)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-200 rounded-lg ${
                  activeContact?._id === contact._id || userId === contact._id
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{contact.username.charAt(0).toUpperCase()}</span>
                    </div>
                    {isUserOnline(contact._id) && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{contact.username}</p>
                    <p className="text-xs text-gray-500">{isUserOnline(contact._id) ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Search Modal */}
      {isSearchOpen && <UserSearch onClose={() => setIsSearchOpen(false)} />}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">Are you sure you want to log out?</h2>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleLogoutConfirmation(true)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-all duration-200"
              >
                Yes
              </button>
              <button
                onClick={() => handleLogoutConfirmation(false)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-all duration-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
