import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-100 to-purple-200 p-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon and Title Section */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out">
          <MessageCircle size={40} className="text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-wide">Connect To FOREVER</h2>
        <p className="text-lg text-gray-700 mb-8 px-4 md:px-0">
          Select a contact from the sidebar to start chatting or add new contacts to expand your network.
        </p>

        

        
      </div>
    </div>
  );
};

export default EmptyChat;
