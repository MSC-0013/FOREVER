import React from 'react';
import { motion } from 'framer-motion';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  showStatus?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'md', 
  isOnline = false,
  showStatus = true 
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-xl'
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative flex-shrink-0">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 
          flex items-center justify-center text-white font-bold shadow-sm`}
      >
        {getInitials(name)}
      </div>
      
      {showStatus && isOnline && (
        <div className="absolute bottom-0 right-0 flex">
          <span className="absolute h-3 w-3 bg-green-500 rounded-full ring-2 ring-white" />
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-3 w-3 bg-green-500 rounded-full ring-2 ring-white opacity-75" 
          />
        </div>
      )}
    </div>
  );
};

export default Avatar;