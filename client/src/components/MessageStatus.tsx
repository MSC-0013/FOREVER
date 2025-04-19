import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

type MessageStatusProps = {
  status: 'sent' | 'delivered' | 'read';
  className?: string;
};

const MessageStatus: React.FC<MessageStatusProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'read':
      return <CheckCheck size={14} className={`text-blue-500 ${className}`} />;
    case 'delivered':
      return <Check size={14} className={`text-gray-400 ${className}`} />;
    case 'sent':
    default:
      return <Clock size={14} className={`text-gray-400 ${className}`} />;
  }
};

export default MessageStatus;