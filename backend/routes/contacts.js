const { DoorBack } = require('@mui/icons-material');
const express = require('express')
const router = express.Router();

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;


    const roleQuery = 'SELECT role FROM users  WHERE id = ?';
    db.query(roleQuery, [userId], (err, results) => {
        if(err) return res.status(500).json({error: err.message})
        if (results.length === 0) return res.status(404).json({ mesage: 'User not found' })
        const role = results[0].role
        
        if (role === 'admin') {
            //Admin sees all parents
            const parentsQuery = 'SELECT id, name, profile_pic FROM users WHERE role= "parent"'
            db.query(parentsQuery, (err, contacts) => {
                if (err) return res.status(500).json({ error: err.message })
                res.status(200).json(contacts)
            })

        } else {
            //Parent sees only admin
            const adminQuery = ' SELECT id, name, profile_pic FROM users WHERE role= "admin" LIMIT 1'
            db.query(adminQuery, (err, admin) => {
                if (err) return res.status(500).json({ error: err.message })
                res.status(200).json(admin)
            })
        }
 
    })
})
module.exports = router;