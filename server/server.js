require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Import routes
const messageRoutes = require("./routes/messages");
const announcementRoutes = require("./routes/announcements");
const subjectRoutes = require("./routes/subjects");
const scheduleRoutes = require("./routes/schedule");
const gradesRoute = require("./routes/grades");
const calendarRoutes = require("./routes/calendar");
const attendanceRoutes = require("./routes/attendance");
const notificationRoutes = require("./routes/notifications");
const messagenotifRoutes = require("./routes/messagenotif");
const subjectlist = require("./routes/subjectlist");

const app = express();
app.use(express.json());
app.use(cors());

// =======================
// DATABASE CONNECTION
// =======================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database Connected!");
  }
});

// =======================
// STUDENTLIST CRUD ROUTES
// =======================

// CREATE student
app.post("/api/studentlist", (req, res) => {
  const { name, student_id, course } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const query =
    "INSERT INTO students (name, student_id, course) VALUES (?, ?, ?)";
  db.query(query, [name, student_id || null, course || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Student added", id: result.insertId });
  });
});

// READ all students
app.get("/api/studentlist", (req, res) => {
  const query = "SELECT * FROM students";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE student
app.put("/api/studentlist/:id", (req, res) => {
  const { name, student_id, course } = req.body;
  const { id } = req.params;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const query =
    "UPDATE students SET name = ?, student_id = ?, course = ? WHERE id = ?";
  db.query(query, [name, student_id, course, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated" });
  });
});

// DELETE student
app.delete("/api/studentlist/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM students WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  });
});

// =======================
// OTHER ROUTES
// =======================
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradesRoute);
app.use("/api/calendar", calendarRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messagenotif", messagenotifRoutes);
app.use("/api/subjectlist", subjectlist);

// =======================
// MULTER SETUP (Profile Uploads)
// =======================
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload Profile Picture
app.post("/upload-profile-pic", upload.single("profilePic"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    db.query(
      "UPDATE users SET profile_pic = ? WHERE id = ?",
      [imageUrl, userId],
      (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Profile picture updated!", profilePic: imageUrl });
      }
    );
  } catch {
    return res.status(401).json({ error: "Invalid Token" });
  }
});

// Serve Uploaded Images
app.use("/uploads", express.static("uploads"));

// =======================
// DELETE ACCOUNT
// =======================
app.delete("/delete-account", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Account deleted successfully" });
    });
  } catch {
    return res.status(401).json({ error: "Invalid Token" });
  }
});

// =======================
// HELP REQUEST
// =======================
app.post("/help", (req, res) => {
  const { userName, issue } = req.body;

  if (!userName || !issue)
    return res.status(400).json({ error: "Missing required fields!" });

  db.query(
    "INSERT INTO help_requests (user_name, issue) VALUES (?, ?)",
    [userName, issue],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to save complaint." });
      res.json({ success: true, message: "Issue submitted successfully." });
    }
  );
});

// =======================
// USER REGISTRATION
// =======================
app.post("/register", (req, res) => {
  const { name, email, password, contactNumber } = req.body;

  if (!name || !email || !password || !contactNumber)
    return res.status(400).json({ error: "All fields are required!" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error!" });

    if (results.length > 0)
      return res.status(400).json({ error: "Email is already registered!" });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: "Error hashing password" });

      const role = "parent";
      const sql =
        "INSERT INTO users (name, email, password, contact_number, role, profile_pic) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        sql,
        [name, email, hashedPassword, contactNumber, role, null],
        (err) => {
          if (err) return res.status(500).json({ error: "Internal Server Error" });
          res.json({ message: "User registered successfully!", role });
        }
      );
    });
  });
});

// =======================
// USER LOGIN
// =======================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "All fields are required!" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });

    if (results.length === 0)
      return res.status(401).json({ error: "User not found!" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: "Error processing login" });
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials!" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful!",
        token,
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        contactNumber: user.contact_number,
        profilePic: user.profile_pic || "/default-profile.png",
      });
    });
  });
});

// =======================
// ROOT ROUTE FIX
// =======================
app.get("/", (req, res) => {
  res.send("✅ Parents Portal backend is running successfully!");
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
