const express = require('express');
const router = express.Router();
const db = require('../db');

// Allowed log types
const VALID_TYPES = ['login', 'logout'];

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

// GET LOGIN / LOGOUT ONLY
router.get('/', (req, res) => {
  const { student_id, user_id } = req.query;

  // ALWAYS include only login/logout
  const typeSql = "type IN (?, ?)";
  const typeParams = ['login', 'logout'];

  // ---- Helper ----
  const buildQueryForStudent = (sid) => {
    let sql = `
      SELECT * FROM activity_logs
      WHERE student_id = ?
      AND ${typeSql}
      ORDER BY created_at DESC
      LIMIT 200
    `;

    let params = [sid, ...typeParams];
    return { sql, params };
  };

  // -------------------------
  // Admin filtering specific student
  // -------------------------
  if (student_id) {
    const { sql, params } = buildQueryForStudent(student_id);

    console.log("\n===== STUDENT FILTER QUERY =====");
    console.log("SQL:", sql);
    console.log("PARAMS:", params);

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

  // -------------------------
  // Normal user: resolve student from users table
  // -------------------------
  if (user_id) {
    const resolveSql = `
      SELECT s.id AS sid
      FROM users u
      JOIN students s 
        ON TRIM(LOWER(s.name)) = TRIM(LOWER(u.name))
      WHERE u.id = ?
      LIMIT 1
    `;

    console.log("\n===== USER RESOLVE QUERY =====");
    console.log("SQL:", resolveSql);
    console.log("PARAMS:", [user_id]);

    db.query(resolveSql, [user_id], (e, rows) => {
      if (e) return res.status(500).json({ error: e.message });
      if (!rows.length) return res.json([]);

      const { sql, params } = buildQueryForStudent(rows[0].sid);

      console.log("\n===== USER FILTER QUERY =====");
      console.log("SQL:", sql);
      console.log("PARAMS:", params);

      db.query(sql, params, (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(logs);
      });
    });
    return;
  }

  // -------------------------
  // Default: Admin view all login/logout
  // -------------------------
  const sql = `
    SELECT * FROM activity_logs
    WHERE ${typeSql}
    ORDER BY created_at DESC
    LIMIT 200
  `;

  const params = [...typeParams];

  console.log("\n===== ADMIN VIEW ALL QUERY =====");
  console.log("SQL:", sql);
  console.log("PARAMS:", params);

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
