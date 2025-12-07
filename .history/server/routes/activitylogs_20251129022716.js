const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure table exists
const ensureTable = () => {
  db.query("SHOW TABLES LIKE 'activity_logs'", (err, rows) => {
    if (err) return;
    if (!rows || !rows.length) {
      const createSql = `
        CREATE TABLE activity_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NULL,
          actor_user_id INT NULL,
          type VARCHAR(64) NOT NULL,
          description VARCHAR(1000) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;
      db.query(createSql, () => {});
    }
  });
};
ensureTable();

// Allowed types
const VALID_TYPES = ['login', 'logout'];

/* =====================================================
   RECORD LOGIN 
   ===================================================== */
router.post('/login', (req, res) => {
  const { user_id } = req.body;

  const sql = `
    SELECT s.id, s.name
    FROM users u
    JOIN students s ON TRIM(LOWER(u.name)) = TRIM(LOWER(s.name))
    WHERE u.id = ?
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(400).json({ error: "Student not found" });

    const student = rows[0];

    db.query(
      "INSERT INTO activity_logs (student_id, actor_user_id, type, description) VALUES (?, ?, 'login', ?)",
      [student.id, user_id, `${student.name} logged in`],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Login recorded" });
      }
    );
  });
});

/* =====================================================
   RECORD LOGOUT
   ===================================================== */
router.post('/logout', (req, res) => {
  const { user_id } = req.body;

  const sql = `
    SELECT s.id, s.name
    FROM users u
    JOIN students s ON TRIM(LOWER(u.name)) = TRIM(LOWER(s.name))
    WHERE u.id = ?
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(400).json({ error: "Student not found" });

    const student = rows[0];

    db.query(
      "INSERT INTO activity_logs (student_id, actor_user_id, type, description) VALUES (?, ?, 'logout', ?)",
      [student.id, user_id, `${student.name} logged out`],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Logout recorded" });
      }
    );
  });
});

/* =====================================================
   GET LOGIN/LOGOUT HISTORY
   ===================================================== */
router.get('/', (req, res) => {
  const { student_id, user_id } = req.query;
  let { type } = req.query;

  // Normalize type
  if (Array.isArray(type)) {
    type = type.filter(t => VALID_TYPES.includes(t));
  } else if (typeof type === "string") {
    type = VALID_TYPES.includes(type) ? [type] : VALID_TYPES;
  } else {
    type = VALID_TYPES;
  }

  const typeSql = `(${type.map(() => "type = ?").join(" OR ")})`;
  const typeParams = [...type];

  const queryForStudent = (sid) => {
    return {
      sql: `SELECT * FROM activity_logs WHERE student_id = ? AND ${typeSql} ORDER BY created_at DESC LIMIT 200`,
      params: [sid, ...typeParams]
    };
  };

  // ADMIN selecting a student
  if (student_id) {
    const { sql, params } = queryForStudent(student_id);
    return db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }

  // Normal user: get their associated student ID
  if (user_id) {
    const resolveSql = `
      SELECT s.id AS sid
      FROM users u
      JOIN students s ON TRIM(LOWER(s.name)) = TRIM(LOWER(u.name))
      WHERE u.id = ?
      LIMIT 1
    `;
    db.query(resolveSql, [user_id], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      if (!rows.length) return res.json([]);

      const { sql, params } = queryForStudent(rows[0].sid);
      db.query(sql, params, (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(logs);
      });
    });
    return;
  }

  // Default: return ALL logs
  const sql = `SELECT * FROM activity_logs WHERE ${typeSql} ORDER BY created_at DESC LIMIT 200`;
  db.query(sql, typeParams, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
