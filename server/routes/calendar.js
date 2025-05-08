
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db");

// Middleware to authenticate
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET events (admin and parent)
router.get("/", authenticate, (req, res) => {
  const sql = "SELECT * FROM calendar_events ORDER BY date ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch events" });

    const formatted = results.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
    }));

    res.json(formatted);
  });
});

// POST new event (admin only)`
router.post("/", authenticate, (req, res) => {
  const { title, start } = req.body;
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can add events" });
  if (!title || !start) return res.status(400).json({ error: "Title and start date required" });

  const date = new Date(start).toISOString().split('T')[0];
  const sql = "INSERT INTO calendar_events (title, date, created_by) VALUES (?, ?, ?)";
  db.query(sql, [title, date, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create event" });

    res.json({ id: result.insertId, title, date });
     const type = 'general'
     const message = ` Admin posted an event`;
    db.query("INSERT INTO notifications (message, type) VALUES (?,?)", [message, type]);

  });
});

// DELETE event (admin only)
router.delete("/:id", authenticate, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can delete events" });

  const sql = "DELETE FROM calendar_events WHERE id = ?";
  db.query(sql, [req.params.id], err => {
    if (err) return res.status(500).json({ error: "Failed to delete event" });
    res.json({ message: "Event deleted successfully" });
  });
});

module.exports = router;
