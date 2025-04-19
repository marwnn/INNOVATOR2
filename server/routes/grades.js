const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware for admin role check
const checkAdmin = (req, res, next) => {
  // In your case, you might want to check if the user has an admin role from a session or some other method.
  // Let's assume we have a `req.user` object that contains the user's role (admin or not).
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
};

// Get all grades (admin can view all, others can view specific student grades)
router.get('/', (req, res) => {
  const studentId = req.query.student_id; // Assume student_id is passed as query param
  const query = studentId
    ? "SELECT * FROM grades WHERE student_id = ?"
    : "SELECT * FROM grades"; // Admin can view all grades

  db.query(query, studentId ? [studentId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new grade (Admin only)
router.post('/', checkAdmin, (req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;

  // Validate input
  if (!student_id || !school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO grades (student_id, school_year, term, subject_code, subject_title, grade, units)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, school_year, term, subject_code, subject_title, grade, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Grade added successfully", id: result.insertId });
  });
});

// Update an existing grade (Admin only)
router.put('/:id', checkAdmin, (req, res) => {
  const { school_year, term, subject_code, subject_title, grade, units } = req.body;
  const gradeId = req.params.id;

  // Validate input
  if (!school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE grades 
    SET school_year = ?, term = ?, subject_code = ?, subject_title = ?, grade = ?, units = ?
    WHERE id = ?`;

  db.query(sql, [school_year, term, subject_code, subject_title, grade, units, gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Grade updated successfully" });
  });
});

// Delete a grade (Admin only)
router.delete('/:id', checkAdmin, (req, res) => {
  const gradeId = req.params.id;

  db.query("DELETE FROM grades WHERE id = ?", [gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Grade deleted successfully" });
  });
});

module.exports = router;
