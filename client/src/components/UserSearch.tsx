import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, UserPlus } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

interface UserSearchProps {
  onClose: () => void;
}

interface UserResult {
  _id: string;
  username: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addContact } = useChat();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/users/search?username=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      setError('Failed to search users');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      await addContact(userId);
      onClose();
    } catch (error) {
      setError('Failed to add contact');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Find Users</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1 px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((user) => (
                  <li key={user._id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddContact(user._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        aria-label="Add contact"
                      >
                        <UserPlus size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchQuery && !isSearching ? (
              <p className="text-center text-gray-500 py-4">No users found. Try a different search.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;