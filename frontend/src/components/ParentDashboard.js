import React from 'react';
import Messages from '../components/Messages/Messages';

const ParentDashboard = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user'));

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome, {currentUser?.name}
        </h1>
        <p className="text-sm text-gray-500">Role: {currentUser?.role}</p>
      </header>

      <section>
        <Messages currentUser={currentUser} />
      </section>
    </div>
  );
};

export default ParentDashboard;

