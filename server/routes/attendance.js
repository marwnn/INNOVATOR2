const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware for admin role check
const checkAdmin = (req, res, next) => {
  // Assuming `req.user` is set with the user's role from a session or other method.
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
};

// Get all attendance records (admin can view all, others can view specific student's attendance)
router.get('/', (req, res) => {
  const studentId = req.query.student_id; // Assume student_id is passed as query param
  const query = studentId
    ? "SELECT * FROM attendance WHERE student_id = ?"
    : "SELECT * FROM attendance"; // Admin can view all attendance records

  db.query(query, studentId ? [studentId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new attendance record (Admin only)
router.post('/', checkAdmin, (req, res) => {
  const { student_id, date, day_of_week, status } = req.body;

  // Validate input
  if (!student_id || !date || !day_of_week || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO attendance (student_id, date, day_of_week, status)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [student_id, date, day_of_week, status], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Attendance record added successfully", id: result.insertId });
  });
});

// Update an existing attendance record (Admin only)
router.put('/:id', checkAdmin, (req, res) => {
  const { status } = req.body;
  const attendanceId = req.params.id;

  // Validate input
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const sql = `
    UPDATE attendance 
    SET status = ?
    WHERE id = ?`;

  db.query(sql, [status, attendanceId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Attendance record updated successfully" });
  });
});

// Delete an attendance record (Admin only)
router.delete('/:id', checkAdmin, (req, res) => {
  const attendanceId = req.params.id;

  db.query("DELETE FROM attendance WHERE id = ?", [attendanceId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Attendance record deleted successfully" });
  });
});

module.exports = router;
