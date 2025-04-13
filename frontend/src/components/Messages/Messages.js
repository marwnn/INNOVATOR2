import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Messages = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);

  const isAdmin = currentUser.role === 'admin';

  // Fetch contact list (only for admin)
  useEffect(() => {
    if (isAdmin) {
      axios.get('/api/contacts')
        .then(res => setContacts(res.data))
        .catch(err => console.error(err));
    } else {
      // For parent, set admin as the only contact
      setContacts([{ id: 1, name: 'Admin', role: 'admin' }]);
      setSelectedContact({ id: 1, name: 'Admin', role: 'admin' });
    }
  }, [isAdmin]);

  // Fetch messages
  useEffect(() => {
    if (!selectedContact) return;
    axios.get(`/api/messages/${currentUser.id}/${selectedContact.id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [selectedContact, currentUser]);

  // Handle sending a new message
  const handleSend = (newMessage) => {
    const data = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      message: newMessage
    };

    axios.post('/api/messages', data)
      .then(() => {
        setMessages(prev => [...prev, {
          sender_id: currentUser.id,
          receiver_id: selectedContact.id,
          message: newMessage,
          timestamp: new Date()
        }]);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="flex h-full">
      {isAdmin && (
        <div className="w-1/4 border-r p-4">
          <h2 className="font-semibold text-lg mb-2">Contacts</h2>
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-200 ${
                selectedContact?.id === contact.id ? 'bg-gray-300' : ''
              }`}
            >
              {contact.name}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b font-semibold">
              Chat with {selectedContact.name}
            </div>
            <MessageList messages={messages} currentUserId={currentUser.id} />
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
