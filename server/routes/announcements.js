const express = require('express');
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// Multer setup for announcement file uploads
const storage = multer.diskStorage({
  destination: "./uploads/announcements/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Get all announcements
router.get('/', (req, res) => {
  db.query('SELECT * FROM announcements ORDER BY date_posted DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Create new announcement (admin only) with file upload
router.post('/', upload.single('file'), (req, res) => {
  const { title, content } = req.body;
  // Allow empty title and content - at least one field or file should be present
  // Check if title/content are empty strings or null/undefined
  const hasTitle = title && title.trim && title.trim().length > 0;
  const hasContent = content && content.trim && content.trim().length > 0;
  const hasFile = req.file !== undefined && req.file !== null;
  
  if (!hasTitle && !hasContent && !hasFile) {
    return res.status(400).json({ error: "Please provide at least a title, content, or file" });
  }

  // Check if file_path column exists, if not add it
  db.query("SHOW COLUMNS FROM announcements LIKE 'file_path'", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    
    if (results.length === 0) {
      // Add file_path column if it doesn't exist
      db.query("ALTER TABLE announcements ADD COLUMN file_path VARCHAR(500) DEFAULT NULL", (alterErr) => {
        if (alterErr) {
          console.error("Error adding file_path column:", alterErr);
        }
      });
    }

    // Prepare file path if file was uploaded
    let filePath = null;
    if (req.file) {
      filePath = `http://localhost:5000/uploads/announcements/${req.file.filename}`;
    }

    // Use empty string or null for empty values
    const titleValue = (title && typeof title === 'string' && title.trim()) ? title.trim() : null;
    const contentValue = (content && typeof content === 'string' && content.trim()) ? content.trim() : null;

    db.query(
      'INSERT INTO announcements (title, content, file_path) VALUES (?, ?, ?)',
      [titleValue, contentValue, filePath],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating announcement: ' + err.message });
        const type = 'general';
        const message = ` Admin posted an announcement`;
        db.query("INSERT INTO notifications (message, type) VALUES (?,?)", [message, type]);

        res.json({ message: 'Announcement created successfully', file_path: filePath });
      }
    );
  });
});

// Delete announcement by ID (admin only)
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM announcements WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error deleting announcement' });
    res.json({ message: 'Announcement deleted successfully' });
  });
});


module.exports = router;
