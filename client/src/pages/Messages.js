import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Messages = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));


  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    axios.get('http://localhost:5000/api/messages/contacts', {
      params: {
        userId: user.id,
        role: user.role
      }
    })
    .then(res => setContacts(res.data))
    .catch(err => console.error(err));
  }, [user]);

  const loadConversation = (contact) => {
    setSelectedContact(contact);

    axios.get('http://localhost:5000/api/messages/conversation', {
      params: {
        sender_id: user.id,
        receiver_id: contact.id
      }
    })
    .then(res => setConversation(res.data))
    .catch(err => console.error(err));
  };
useEffect(() => {
  if (!selectedContact) return;

  const interval = setInterval(() => {
    axios.get('http://localhost:5000/api/messages/conversation', {
      params: {
        sender_id: user.id,
        receiver_id: selectedContact.id
      }
    })
    .then(res => setConversation(res.data))
    .catch(err => console.error(err));
  }, 1000); 

  return () => clearInterval(interval); // cleanup on unmount or contact change
}, [selectedContact, user.id]);


  const sendMessage = () => {
    if (!newMessage.trim()) return;
    axios.post('http://localhost:5000/api/messages', {
      sender_id: user.id,
      receiver_id: selectedContact.id,
      message: newMessage
    })
    .then(() => {
      setConversation([...conversation, {
        sender_id: user.id,
        receiver_id: selectedContact.id,
        message: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage("");
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="message-page" style={{ display: 'flex', height: '90vh' }}>
      <div className="contacts-list" style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
      

        <h3>Contacts</h3>
        {contacts.map(contact => (
          <div
            key={contact.id}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: selectedContact?.id === contact.id ? '#f0f0f0' : 'transparent'
            }}
            onClick={() => loadConversation(contact)}
          >
            {contact.full_name} <br /><small>{contact.email}</small>
          </div>
        ))}
      </div>
     
      <div className="chat-box" style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <h3>Chat with {selectedContact.name}</h3>
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: msg.sender_id === user.id ? 'right' : 'left',
                    marginBottom: '5px'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: msg.sender_id === user.id ? '#d1e7dd' : '#f8d7da',
                      padding: '8px',
                      borderRadius: '10px'
                    }}
                  >
                    {msg.message}
                  </div>
                  <br />
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))}
            </div>
            <div className="chat-input" style={{ display: 'flex', gap: '10px' }}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, width:'100px' }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
            <p>Select a contact to start chatting</p>
            
        )}
      </div>
    </div>
  );
};

export default Messages;
