import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  contactUsername: string | undefined;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ contactUsername }) => {
  return (
    <motion.div 
      className="flex justify-start" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
    >
      <div className="flex items-end space-x-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {contactUsername?.[0].toUpperCase()}
        </div>
        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[120px] flex items-center space-x-1">
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
            className="w-2 h-2 bg-slate-400 rounded-full" 
          />
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.15 }}
            className="w-2 h-2 bg-slate-400 rounded-full" 
          />
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            className="w-2 h-2 bg-slate-400 rounded-full" 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;