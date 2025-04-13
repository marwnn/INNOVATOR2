import React, {useState} from 'react'

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('')
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return
        onSend(message)
        setMessage('')
    }
  return (
      <form onSubmit={handleSubmit} className="flex p-4 border-t">
          <input 
              className="flex-1 p-2 border rounded-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type your message...'
          />
          <button type="submit" 
              className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600">
              Send
          </button>
   </form>
  )
}

export default MessageInput
