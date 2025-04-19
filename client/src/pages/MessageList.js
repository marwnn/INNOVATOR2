import React from 'react';

const MessageList = ({ messages, currentUserId }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-2 max-w-sm p-3 rounded-lg shadow-sm ${
            msg.sender_id === currentUserId
              ? 'ml-auto bg-blue-200 text-right'
              : 'bg-white'
          }`}
        >
          <div className="text-sm">{msg.message}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
