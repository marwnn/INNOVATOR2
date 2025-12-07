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

// Helper: force allowed log types only
const VALID_TYPES = ['login', 'logout'];

// GET LOGIN/LOGOUT HISTORY
router.get('/', (req, res) => {
  const { student_id, user_id } = req.query;
  let { type } = req.query;

  // If frontend passes array, normalize it
  if (Array.isArray(type)) {
    type = type.filter(t => VALID_TYPES.includes(t));
  } else if (typeof type === "string") {
    type = VALID_TYPES.includes(type) ? [type] : VALID_TYPES;
  } else {
    type = VALID_TYPES;
  }

  // Build type filter SQL
  const typeSql = `(${type.map(() => "type = ?").join(" OR ")})`;
  const typeParams = [...type];

  // Helper: build query for student
  const buildQueryForStudent = (sid) => {
    let sql = `SELECT * FROM activity_logs WHERE student_id = ? AND ${typeSql} ORDER BY created_at DESC LIMIT 200`;
    const params = [sid, ...typeParams];
    return { sql, params };
  };

  // If admin selects a student
  if (student_id) {
    const { sql, params } = buildQueryForStudent(student_id);
    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

  // If normal user → get his student table ID
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

      const { sql, params } = buildQueryForStudent(rows[0].sid);
      db.query(sql, params, (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(logs);
      });
    });
    return;
  }

  // Default: return ALL login/logout logs
  const sql = `SELECT * FROM activity_logs WHERE ${typeSql} ORDER BY created_at DESC LIMIT 200`;
  db.query(sql, typeParams, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

