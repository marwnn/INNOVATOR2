import React from 'react';

const MessageList = ({ messages, currentUserId }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-2 max-w-sm p-2 rounded-lg ${
            msg.sender_id === currentUserId ? 'ml-auto bg-blue-200' : 'bg-white'
          }`}
        >
          <div className="text-sm">{msg.message}</div>
          <div className="text-xs text-gray-500 text-right">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
