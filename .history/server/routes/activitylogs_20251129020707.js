const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================================
// BUILD QUERY FUNCTION (ADMIN + STUDENT)
// ========================================
function buildActivityQuery(userType, studentId) {
  let sql = `
    SELECT 
      id,
      student_id,
      action,
      type,
      ip_address,
      user_agent,
      created_at
    FROM activity_logs
    WHERE 1 = 1
  `;
  
  let params = [];

  // If STUDENT → limit to own logs
  if (userType === "student") {
    sql += " AND student_id = ? ";
    params.push(studentId);
  }

  // Filter only login/logout
  sql += " AND type IN (?, ?) ";
  params.push("login", "logout");

  // Default order + limit
  sql += " ORDER BY created_at DESC LIMIT 200";

  return { sql, params };
}

// ========================================
// ADMIN: VIEW ALL ACTIVITY LOGS
// ========================================
router.get("/admin", (req, res) => {
  const { sql, params } = buildActivityQuery("admin");

  // Debug log
  console.log("===== ADMIN VIEW ALL QUERY =====");
  console.log("SQL:", sql);
  console.log("PARAMS:", params);

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// ========================================
// STUDENT: VIEW OWN ACTIVITY LOGS
// ========================================
router.get("/student/:id", (req, res) => {
  const studentId = req.params.id;

  const { sql, params } = buildActivityQuery("student", studentId);

  // Debug log
  console.log("===== STUDENT VIEW QUERY =====");
  console.log("SQL:", sql);
  console.log("PARAMS:", params);

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// ========================================
module.exports = router;
