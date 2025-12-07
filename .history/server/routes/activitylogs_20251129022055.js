const express = require('express');
const router = express.Router();
const db = require('../db');

// Allowed types
const VALID_TYPES = ['login', 'logout'];

router.get('/', (req, res) => {
  const { student, user_id } = req.query;
  let { type } = req.query;

  // Normalize type input
  if (Array.isArray(type)) {
    type = type.filter(t => VALID_TYPES.includes(t));
  } else if (typeof type === "string") {
    type = VALID_TYPES.includes(type) ? [type] : VALID_TYPES;
  } else {
    type = VALID_TYPES;
  }

  const typeSql = `(${type.map(() => "a.type = ?").join(" OR ")})`;
  const typeParams = [...type];

  // Base SELECT (NO IDs)
  const BASE_SELECT = `
    SELECT 
      s.fullname AS user,
      a.type,
      a.description,
      a.created_at
    FROM activity_logs a
    LEFT JOIN students s ON s.id = a.student_id
  `;

  // When admin selects name of student
  if (student) {
    const sql = `
      ${BASE_SELECT}
      WHERE TRIM(LOWER(s.fullname)) = TRIM(LOWER(?))
      AND ${typeSql}
      ORDER BY a.created_at DESC
      LIMIT 200
    `;
    db.query(sql, [student, ...typeParams], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

  // Normal user → match using users.name == students.fullname
  if (user_id) {
    const resolveSql = `
      SELECT s.fullname AS student_name
      FROM users u
      JOIN students s ON TRIM(LOWER(s.fullname)) = TRIM(LOWER(u.name))
      WHERE u.id = ?
      LIMIT 1
    `;

    db.query(resolveSql, [user_id], (err, match) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!match.length) return res.json([]);

      const studentName = match[0].student_name;

      const sql = `
        ${BASE_SELECT}
        WHERE TRIM(LOWER(s.fullname)) = TRIM(LOWER(?))
        AND ${typeSql}
        ORDER BY a.created_at DESC
        LIMIT 200
      `;

      db.query(sql, [studentName, ...typeParams], (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(logs);
      });
    });

    return;
  }

  // Default: ALL logs (NO IDs)
  const sql = `
    ${BASE_SELECT}
    WHERE ${typeSql}
    ORDER BY a.created_at DESC
    LIMIT 200
  `;

  db.query(sql, typeParams, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
