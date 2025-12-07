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

// GET activity logs
router.get('/', (req, res) => {
  const { student_id, user_id, type } = req.query;

  const buildQueryForStudent = (sid) => {
    let sql = "SELECT * FROM activity_logs WHERE student_id = ?";
    const params = [sid];
    if (type) { sql += " AND type = ?"; params.push(type); }
    sql += " ORDER BY created_at DESC LIMIT 200";
    return { sql, params };
  };

  if (student_id) {
    const { sql, params } = buildQueryForStudent(student_id);
    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

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

  db.query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

