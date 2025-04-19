import React from 'react';

type DateDividerProps = {
  date: string;
};

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  // Format the date to be more human-readable
  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if date is yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return the formatted date
    return new Date(dateString).toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex justify-center my-3">
      <div className="px-3 py-1 bg-slate-200 rounded-full text-xs text-slate-600 font-medium">
        {formatDate(date)}
      </div>
    </div>
  );
};

export default DateDivider;