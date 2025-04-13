const express = require('express');
const router = express.Router();
const db = require('../server.js');

//Send a message 
router.post('/', (req, res) => {
    const { sender_id, receiver_id, message } = req.body;

   const sql = 'INSERT INTO messages (sender_id, receiver_id, message, timestamp) VALUES (?, ?, ?, NOW())';
  db.query(sql, [sender_id, receiver_id, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Message sent!' });
  });
});
//Get conversation
router.get('/:sender_id/receiver_id', (req, res) => {
    const { sender_id, receiver_id } = req.params
    
    const sql = `SELECT * FROM messages
    WHERE (sender_id= ? AND receiver_id=?)
    OR 
    (sender_id= ? AND receiver_id=?)
    ORDER BY timestamp ASC`

    db.query(sql, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results)
    })
})
module.exports = router;
