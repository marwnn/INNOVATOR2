const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust this path if you have a separate db connection file, else we will use from server.js

// If you don't have a separate db export, replace `db` with your mysql connection from server.js, or pass it.

router.get('/', (req, res) => {
  db.query('SELECT * FROM student ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { name, student_id, course } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  db.query(
    'INSERT INTO student (name, student_id, course) VALUES (?, ?, ?)',
    [name, student_id || null, course || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student added', id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, student_id, course } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  db.query(
    'UPDATE student SET name = ?, student_id = ?, course = ? WHERE id = ?',
    [name, student_id || null, course || null, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student updated' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM student WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted' });
  });
});

module.exports = router;
