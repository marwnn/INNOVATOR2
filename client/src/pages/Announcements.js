import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const currentUser = JSON.parse(sessionStorage.getItem("user")) || {};
 const isAdmin = currentUser?.role === 'admin';


  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
    try {
      await axios.post('http://localhost:5000/api/announcements', { title, content });
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/announcements/${id}`);
    fetchAnnouncements();
  } catch (err) {
    console.error('Delete failed:', err);
  }
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Announcements</h1>

      {isAdmin && (
        <div className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Title"
            className="w-full border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your announcement..."
            className="w-full border p-2 h-24"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handlePost}
          >
            Post Announcement
          </button>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="border p-4 rounded bg-white shadow">
            <div className="text-sm text-gray-500">{new Date(a.date_posted).toLocaleString()}</div>
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <p>{a.content}</p>
            {isAdmin && (
              <button
                className="text-red-500 mt-2 text-sm"
                onClick={() => handleDelete(a.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;


