const express = require('express');
const router = express.Router();
const db = require("../db");

// Get all announcements
router.get('/', (req, res) => {
  db.query('SELECT * FROM announcements ORDER BY date_posted DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Create new announcement (admin only)
router.post('/', (req, res) => {
  const { title, content } = req.body;
  db.query(
    'INSERT INTO announcements (title, content) VALUES (?, ?)',
    [title, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error creating announcement' });
      res.json({ message: 'Announcement created successfully' });
    }
  );
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
