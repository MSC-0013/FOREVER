import React, { useState, useRef, useEffect } from 'react';
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal on Escape
      if (e.key === 'Escape') {
        onClose();
      }

      // Keep focus locked in input
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">🔍 Find Users</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="w-full pl-10 pr-24 py-2.5 border rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 text-sm rounded-md">{error}</div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((user) => (
                  <li key={user._id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-900 font-medium">{user.username}</p>
                      </div>
                      <button
                        onClick={() => handleAddContact(user._id)}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"
                        aria-label="Add contact"
                      >
                        <UserPlus size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchQuery && !isSearching ? (
              <p className="text-center text-gray-500 py-4">😕 No users found.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
