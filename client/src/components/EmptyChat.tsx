import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to ChatConnect</h2>
        <p className="text-gray-600 mb-6">
          Select a contact from the sidebar to start chatting or add new contacts to expand your network.
        </p>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li>• Click on the '+' icon to search for and add new contacts</li>
            <li>• Green dot indicates a user is currently online</li>
            <li>• You'll see typing indicators when someone is writing</li>
            <li>• All messages are saved in your chat history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;