import React from 'react';
import Messages from './Messages';

const ParentMessages = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user'));
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <Messages currentUser={currentUser} />
    </div>
  );
};

export default ParentMessages;
