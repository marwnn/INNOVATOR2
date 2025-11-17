import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Announcements.css"
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Check if file is an image
  const isImageFile = (file) => {
    if (!file) return false;
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    return imageTypes.includes(file.type);
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title || '');
      formData.append('content', content || '');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await axios.post('http://localhost:5000/api/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setContent('');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement: ' + (err.response?.data?.error || err.message));
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
    <div className="announcements-container">
      <h1 className="page-title">Announcements</h1>

      {isAdmin && (
        <div className="announcement-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your announcement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="file-upload-section">
            <label htmlFor="file-input" className="file-upload-label">
              <AttachFileIcon /> {selectedFile ? selectedFile.name : 'Attach File'}
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {selectedFile && (
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => {
                  setSelectedFile(null);
                  const fileInput = document.getElementById('file-input');
                  if (fileInput) fileInput.value = '';
                }}
              >
                <DeleteIcon /> Remove
              </button>
            )}
          </div>
          <button onClick={handlePost}>
            Post Announcement
          </button>
        </div>
      )}

      <div className="announcement-list">
        {announcements.map((a) => (
          <div key={a.id} className="announcement-card">
            <div className="announcement-date">{new Date(a.date_posted).toLocaleString()}</div>
            {a.title && <h2 className="announcement-title">{a.title}</h2>}
            {a.content && <p className="announcement-content">{a.content}</p>}
            {a.file_path && (
              <div className="announcement-file">
                {(() => {
                  // Check if file is an image by extension
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(a.file_path);
                  if (isImage) {
                    return (
                      <div className="announcement-image-container">
                        <img 
                          src={a.file_path} 
                          alt="Announcement attachment" 
                          className="announcement-image"
                          onClick={() => window.open(a.file_path, '_blank')}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <a 
                        href={a.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-download-link"
                      >
                        <DownloadIcon /> Download Attached File
                      </a>
                    );
                  }
                })()}
              </div>
            )}
            {isAdmin && (
              <button
                className="delete-btn"
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


