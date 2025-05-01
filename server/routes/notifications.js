const express = require('express');
const router = express.Router();
const db = require('../db');

// Get latest notifications (limit to 10)
router.get('/', (req, res) => {
  db.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

module.exports = router;
