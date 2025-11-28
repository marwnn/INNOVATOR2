const express = require('express');
const router = express.Router();
const db = require('../db'); 

// GET contacts 
router.get('/contacts', (req, res) => {
  const userId = req.query.userId;
  const role = req.query.role;
 
  let query = "";
  if (role === 'admin') {
    query = "SELECT id, name, email FROM users WHERE role = 'parent'";
  } else {
    query = "SELECT id, name, email FROM users WHERE role = 'admin'";
  }

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// GET conversation between two users
router.get('/conversation', (req, res) => {
  const { sender_id, receiver_id } = req.query;

  const query = `
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ? )
       OR (sender_id = ?  AND receiver_id = ? )
    ORDER BY timestamp ASC
  `;

  db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
    
  });
});

// POST new message
router.post('/', (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  
  const query = `
    INSERT INTO messages (sender_id, receiver_id, message, timestamp)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(query, [sender_id, receiver_id, message], (err, result) => {
    if (err) return res.status(500).json({ error: err });
  
    //get the sender's name
    const senderQuery = "SELECT name FROM users WHERE id=?";
    db.query(senderQuery, [sender_id], (err, senderResult) => {
      if (err) return res.status(500).json({ error: 'Error fetching sender name' })
      const senderName = senderResult[0]?.name || 'Someone';
    
      // Add notification
     const timestamp = new Date().toLocaleString();
    const notifMessage = ` You received a message from ${senderName} (${timestamp})`;
      const messagenotifQuery = `
        INSERT INTO messagenotif (user_id, message)
        VALUES (?, ?)
      `;

      db.query(messagenotifQuery, [receiver_id, notifMessage], (err) => {
        if (err) return res.status(500).json({ error: "Message sent but failed to notify" });

        // Log activity for sender
        const resolveSender = "SELECT id FROM students WHERE TRIM(LOWER(name)) = TRIM(LOWER((SELECT name FROM users WHERE id = ?))) LIMIT 1";
        db.query(resolveSender, [sender_id], (rsErr, rsRows) => {
          if (!rsErr && rsRows && rsRows.length) {
            const sid = rsRows[0].id;
            db.query(
              "INSERT INTO activity_logs (student_id, actor_user_id, type, description) VALUES (?, ?, 'message_send', ?)",
              [sid, sender_id, `Sent a message to user ${receiver_id}`]
            );
          }
        });

        // Log activity for receiver (if receiver is a student)
        const resolveReceiver = "SELECT id FROM students WHERE TRIM(LOWER(name)) = TRIM(LOWER((SELECT name FROM users WHERE id = ?))) LIMIT 1";
        db.query(resolveReceiver, [receiver_id], (rrErr, rrRows) => {
          if (!rrErr && rrRows && rrRows.length) {
            const sid = rrRows[0].id;
            db.query(
              "INSERT INTO activity_logs (student_id, actor_user_id, type, description) VALUES (?, ?, 'message_receive', ?)",
              [sid, sender_id, `Received a message from user ${sender_id}`]
            );
          }
        });

        res.json({ message: "Message sent", id: result.insertId });
      });
    });
  });
});


module.exports = router;
