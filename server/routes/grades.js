const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all grades
router.get('/', (req, res) => {
  const studentId = req.query.student_id; // may be internal (students.id) or external (students.student_id)
  const studentName = req.query.student_name;
  const userId = req.query.user_id; // users.id (when logged-in user is a student/parent)

  let query;
  let params = [];

  if (userId) {
    // Resolve student's record using multiple strategies tied to this user
    // 1) Match by name (existing behavior)
    // 2) Fallback: if no match, try where students.id = users.id
    // 3) Fallback: try where students.student_id = users.id (some datasets store external code as numeric)
    const resolveSql = `
      SELECT s.id AS student_internal_id
      FROM users u
      JOIN students s ON TRIM(LOWER(s.name)) = TRIM(LOWER(u.name))
      WHERE u.id = ?
      UNION
      SELECT s2.id AS student_internal_id
      FROM users u2
      JOIN students s2 ON s2.id = u2.id
      WHERE u2.id = ?
      UNION
      SELECT s3.id AS student_internal_id
      FROM users u3
      JOIN students s3 ON CAST(s3.student_id AS CHAR) = CAST(u3.id AS CHAR)
      WHERE u3.id = ?
      LIMIT 1
    `;
    db.query(resolveSql, [userId, userId, userId], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (rows.length === 0) return res.json([]);
      const studentInternalId = rows[0].student_internal_id;

      const gradesSql = `
        SELECT g.*, s.name AS student_name, s.student_id AS student_code
        FROM grades g
        LEFT JOIN students s ON (
          g.student_id = s.id OR g.student_id = s.student_id
        )
        WHERE s.id = ?
      `;
      db.query(gradesSql, [studentInternalId], (err2, results) => {
        if (err2) return res.status(500).json({ error: "Database error" });
        res.json(results);
      });
    });
    return;
  } else if (studentName) {
    query = `
      SELECT grades.*, students.name AS student_name, students.student_id AS student_code
      FROM grades
      LEFT JOIN students ON (
        grades.student_id = students.id OR grades.student_id = students.student_id
      )
      WHERE students.name = ?
    `;
    params = [studentName];
  } else if (studentId) {
    query = `
      SELECT grades.*, students.name AS student_name, students.student_id AS student_code
       FROM grades 
      LEFT JOIN students ON (
        grades.student_id = students.id OR grades.student_id = students.student_id
      )
      WHERE grades.student_id = ? OR students.id = ? OR students.student_id = ?
    `;
    params = [studentId, studentId, studentId];
  } else {
    query = `
      SELECT grades.*, students.name AS student_name, students.student_id AS student_code
       FROM grades 
      LEFT JOIN students ON (
        grades.student_id = students.id OR grades.student_id = students.student_id
      )
    `;
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new grade
router.post('/', (req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;

  if (!student_id || !school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO grades (student_id, school_year, term, subject_code, subject_title, grade, units)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, school_year, term, subject_code, subject_title, grade, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const message = `Admin added a new grade: ${subject_title}`;
    db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [student_id, message]);

    res.json({ message: "Grade added successfully", id: result.insertId });
  });
});

// Update a grade
router.put('/:id', (req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;
  const gradeId = req.params.id;

  if (!school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE grades 
    SET school_year = ?, term = ?, subject_code = ?, subject_title = ?, grade = ?, units = ?
    WHERE id = ?`;

  db.query(sql, [school_year, term, subject_code, subject_title, grade, units, gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const message = `Admin updated a grade: ${subject_title}`;
    db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [student_id, message]);

    res.json({ message: "Grade updated successfully" });
  });
});

// Delete a grade
router.delete('/:id', (req, res) => {
  const gradeId = req.params.id;

  db.query("DELETE FROM grades WHERE id = ?", [gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Grade deleted successfully" });
  });
});

module.exports = router;
