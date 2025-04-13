import React from 'react';
import Messages from '../components/Messages/Messages';

const AdminDashboard = () => {
  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {currentUser.name}</h1>
      <Messages currentUser={currentUser} />
    </div>
  );
};

export default AdminDashboard;

