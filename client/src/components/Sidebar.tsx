import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, UserPlus, LogOut, MessageCircle } from 'lucide-react';
import UserSearch from './UserSearch';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { contacts, fetchContacts, activeContact, setActiveContact } = useChat();
  const { onlineUsers } = useSocket();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <MessageCircle className="text-blue-600 mr-2" size={24} />
          <h1 className="text-xl font-semibold text-gray-800">ChatConnect</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Search users"
          >
            <UserPlus size={20} className="text-gray-600" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-gray-100 md:flex hidden"
            aria-label="Logout"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-2">
          Recent Chats
        </h2>
        {contacts.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            No contacts yet. Add someone to chat!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <li
                key={contact._id}
                onClick={() => handleContactClick(contact)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  activeContact?._id === contact._id || userId === contact._id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {contact.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isUserOnline(contact._id) && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{contact.username}</p>
                    <p className="text-xs text-gray-500">
                      {isUserOnline(contact._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Search Modal */}
      {isSearchOpen && (
        <UserSearch onClose={() => setIsSearchOpen(false)} />
      )}
    </div>
  );
};

export default Sidebar;