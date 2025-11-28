const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");

// -------------------------------
// GET ALL ATTENDANCE
// -------------------------------
router.get("/", (req, res) => {const express = require("express"); const router = express.Router(); const db = require("../db"); const crypto = require("crypto"); // Get all attendance records router.get("/", (req, res) => { const userId = req.query.user_id; let query = SELECT a.*, s.name AS student_name, s.student_code, sub.subject_code, sub.subject_title FROM attendance a LEFT JOIN students s ON a.student_id = s.id LEFT JOIN subjects sub ON a.subject_id = sub.id ; if (userId) { query += WHERE a.student_id = (SELECT id FROM students WHERE name = (SELECT name FROM users WHERE id = ?) LIMIT 1); } query += " ORDER BY a.date DESC"; db.query(query, userId ? [userId] : [], (err, results) => { if (err) return res.status(500).json({ error: "Database error: " + err.message }); res.json(results); }); }); // Add attendance manually router.post("/", (req, res) => { const { student_id, date, day_of_week, status } = req.body; if (!student_id || !date || !status) return res.status(400).json({ error: "Missing fields" }); const insertRow = (sid) => { const sql = "INSERT INTO attendance (student_id, date, day_of_week, status) VALUES (?, ?, ?, ?)"; db.query(sql, [sid, date, day_of_week, status], (err, result) => { if (err) return res.status(500).json({ error: err.message }); res.json({ id: result.insertId }); }); }; const numericId = Number(student_id); if (!Number.isNaN(numericId)) { insertRow(numericId); } else { db.query("SELECT id FROM students WHERE student_code = ? LIMIT 1", [student_id], (e, rows) => { if (e) return res.status(500).json({ error: e.message }); if (!rows.length) return res.status(400).json({ error: "Student not found" }); insertRow(rows[0].id); }); } }); // Update router.put("/:id", (req, res) => { db.query( "UPDATE attendance SET status = ? WHERE id = ?", [req.body.status, req.params.id], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "Updated" }); } ); }); // Delete router.delete("/:id", (req, res) => { db.query("DELETE FROM attendance WHERE id = ?", [req.params.id], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "Deleted" }); }); }); // Create QR session router.post("/qr-session", (req, res) => { const { subject_id, expiresInMinutes } = req.body; if (!subject_id) return res.status(400).json({ error: "subject_id required" }); const token = crypto.randomBytes(16).toString("hex"); const sql = "INSERT INTO attendance_sessions (token, subject_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))"; db.query(sql, [token, subject_id, expiresInMinutes || 15], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ token, subject_id, expiresAt: new Date(Date.now() + (expiresInMinutes || 15) * 60000), }); }); }); // Deactivate session router.post("/qr-session/:token/deactivate", (req, res) => { db.query( "UPDATE attendance_sessions SET active = 0 WHERE token = ?", [req.params.token], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "Deactivated" }); } ); }); // QR check-in router.post("/qr-checkin", (req, res) => { const { token, user_id } = req.body; db.query( SELECT * FROM attendance_sessions WHERE token = ? AND active = 1 AND NOW() < expires_at, [token], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); if (!rows.length) return res.status(400).json({ error: "Invalid or expired session" }); const subject_id = rows[0].subject_id; const findStudent = SELECT id FROM students WHERE name = (SELECT name FROM users WHERE id = ?) LIMIT 1; db.query(findStudent, [user_id], (e2, studentRows) => { if (e2) return res.status(500).json({ error: e2.message }); if (!studentRows.length) return res.status(400).json({ error: "Student not found" }); const student_id = studentRows[0].id; db.query("SHOW COLUMNS FROM attendance LIKE 'checkin_time'", (colErr, cols) => { if (colErr) return res.status(500).json({ error: colErr.message }); const proceedInsert = () => { const insertSql = INSERT INTO attendance (student_id, subject_id, date, day_of_week, status, checkin_time) VALUES (?, ?, CURDATE(), DATE_FORMAT(CURDATE(), '%W'), 'Present', NOW()) ; db.query(insertSql, [student_id, subject_id], (e3) => { if (e3) return res.status(500).json({ error: e3.message }); res.json({ message: "Attendance recorded" }); }); }; if (!cols.length) { db.query("ALTER TABLE attendance ADD COLUMN checkin_time DATETIME DEFAULT NULL", (alterErr) => { if (alterErr) return res.status(500).json({ error: alterErr.message }); proceedInsert(); }); } else { proceedInsert(); } }); }); } ); }); // Mark absentees router.post("/qr-session/:token/mark-absent", (req, res) => { const { token } = req.params; db.query( "SELECT subject_id FROM attendance_sessions WHERE token = ? AND active = 1", [token], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); if (!rows.length) return res.status(400).json({ error: "Session not found" }); const subject_id = rows[0].subject_id; db.query("SELECT id FROM students", [], (e2, students) => { if (e2) return res.status(500).json({ error: e2.message }); students.forEach((s) => { db.query( INSERT IGNORE INTO attendance (student_id, subject_id, date, day_of_week, status) VALUES (?, ?, CURDATE(), DATE_FORMAT(CURDATE(), '%W'), 'Absent'), [s.id, subject_id] ); }); res.json({ message: "Absentees marked" }); }); } ); }); module.exports = router;
  const userId = req.query.user_id;

  let query = `
    SELECT 
      a.*, 
      s.id AS student_id,
      s.name AS student_name, 
      s.student_id AS student_code,
      sub.subject_code, 
      sub.subject_title
    FROM attendance a
    LEFT JOIN students s ON a.student_id = s.id
    LEFT JOIN subjects sub ON a.subject_id = sub.id
  `;

  if (userId) {
    query += `
      WHERE a.student_id = (
        SELECT id 
        FROM students 
        WHERE name = (SELECT name FROM users WHERE id = ?) 
        LIMIT 1
      )
    `;
  }

  query += ` ORDER BY a.date DESC`;

  db.query(query, userId ? [userId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    res.json(results);
  });
});

// -------------------------------
// ADD ATTENDANCE (MANUAL)
// -------------------------------
router.post("/", (req, res) => {
  const { student_id, date, day_of_week, status } = req.body;

  if (!student_id || !date || !status)
    return res.status(400).json({ error: "Missing fields" });

  const insertRow = (sid) => {
    const sql = `
      INSERT INTO attendance (student_id, date, day_of_week, status) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [sid, date, day_of_week, status], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    });
  };

  // If student_id is numeric (real ID)
  const numericId = Number(student_id);
  if (!Number.isNaN(numericId)) {
    insertRow(numericId);
  } else {
    db.query("SHOW COLUMNS FROM students LIKE 'student_code'", (colErr, cols) => {
      if (colErr) return res.status(500).json({ error: colErr.message });
      const sql = cols.length
        ? "SELECT id FROM students WHERE student_code = ? LIMIT 1"
        : "SELECT id FROM students WHERE student_id = ? LIMIT 1";
      db.query(sql, [student_id], (e, rows) => {
        if (e) return res.status(500).json({ error: e.message });
        if (!rows.length) return res.status(400).json({ error: "Student not found" });
        insertRow(rows[0].id);
      });
    });
  }
});

// -------------------------------
// UPDATE ATTENDANCE
// -------------------------------
router.put("/:id", (req, res) => {
  db.query(
    "UPDATE attendance SET status = ? WHERE id = ?",
    [req.body.status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Updated" });
    }
  );
});

// -------------------------------
// DELETE ATTENDANCE
// -------------------------------
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM attendance WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// -------------------------------
// CREATE QR SESSION
// -------------------------------
router.post("/qr-session", (req, res) => {
  const { subject_id, expiresInMinutes } = req.body;
  if (!subject_id) return res.status(400).json({ error: "subject_id required" });
  db.query(
    "SELECT id FROM attendance_sessions WHERE subject_id = ? AND DATE(expires_at) = CURDATE() LIMIT 1",
    [subject_id],
    (checkErr, rows) => {
      if (checkErr) return res.status(500).json({ error: checkErr.message });
      if (rows && rows.length) return res.status(400).json({ error: "A QR session has already been generated for this subject today" });
      const token = crypto.randomBytes(16).toString("hex");
      const sql =
        "INSERT INTO attendance_sessions (token, subject_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))";
      db.query(sql, [token, subject_id, expiresInMinutes || 15], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          token,
          subject_id,
          expiresAt: new Date(Date.now() + (expiresInMinutes || 15) * 60000),
        });
      });
    }
  );
});

// -------------------------------
// DEACTIVATE QR SESSION
// -------------------------------
router.post("/qr-session/:token/deactivate", (req, res) => {
  db.query(
    "UPDATE attendance_sessions SET active = 0 WHERE token = ?",
    [req.params.token],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Deactivated" });
    }
  );
});

// -------------------------------
// QR CHECK-IN
// -------------------------------
router.post("/qr-checkin", (req, res) => {
  const { token, user_id } = req.body;

  db.query(
    "SELECT * FROM attendance_sessions WHERE token = ? AND active = 1 AND NOW() < expires_at",
    [token],
    (err, sessionRows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!sessionRows.length)
        return res.status(400).json({ error: "Invalid or expired session" });

      const subject_id = sessionRows[0].subject_id;

      const findStudent = `
        SELECT id FROM students 
        WHERE name = (SELECT name FROM users WHERE id = ?) 
        LIMIT 1
      `;

      db.query(findStudent, [user_id], (e2, studentRows) => {
        if (e2) return res.status(500).json({ error: e2.message });
        if (!studentRows.length)
          return res.status(400).json({ error: "Student not found" });

        const student_id = studentRows[0].id;

        // Check if checkin_time exists
        db.query("SHOW COLUMNS FROM attendance LIKE 'checkin_time'", (colErr, cols) => {
          if (colErr) return res.status(500).json({ error: colErr.message });

          const insertAttendance = () => {
            const insertSql = `
              INSERT INTO attendance 
              (student_id, subject_id, date, day_of_week, status, checkin_time)
              VALUES (?, ?, CURDATE(), DATE_FORMAT(CURDATE(), '%W'), 'Present', NOW())
            `;
            db.query(insertSql, [student_id, subject_id], (e3) => {
              if (e3) return res.status(500).json({ error: e3.message });
              res.json({ message: "Attendance recorded" });
            });
          };

          if (!cols.length) {
            db.query(
              "ALTER TABLE attendance ADD COLUMN checkin_time DATETIME DEFAULT NULL",
              (alterErr) => {
                if (alterErr) return res.status(500).json({ error: alterErr.message });
                insertAttendance();
              }
            );
          } else {
            insertAttendance();
          }
        });
      });
    }
  );
});

// -------------------------------
// MARK ABSENTEES
// -------------------------------
router.post("/qr-session/:token/mark-absent", (req, res) => {
  const { token } = req.params;

  db.query(
    "SELECT subject_id FROM attendance_sessions WHERE token = ? AND active = 1",
    [token],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(400).json({ error: "Session not found" });

      const subject_id = rows[0].subject_id;

      db.query("SELECT id FROM students", [], (e2, students) => {
        if (e2) return res.status(500).json({ error: e2.message });

        students.forEach((s) => {
          db.query(
            `
            INSERT IGNORE INTO attendance 
            (student_id, subject_id, date, day_of_week, status)
            VALUES (?, ?, CURDATE(), DATE_FORMAT(CURDATE(), '%W'), 'Absent')
          `,
            [s.id, subject_id]
          );
        });

        res.json({ message: "Absentees marked" });
      });
    }
  );
});

module.exports = router;
