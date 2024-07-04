const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticate');
// Secret key for JWT
const JWT_SECRET = 'dacnpm';

// Create a new university account
router.post('/register', async (req, res) => {
    const university = req.body;

    // Hash the password for university (optional based on requirements)
    const hashedPassword = await bcrypt.hash(university.password, 10);

    // Always set role to "university"
    const role = 'university';

    // Insert into users table
    const userQuery = `
      INSERT INTO users (name, studentId, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    req.connection.query(userQuery, [university.name, null, university.email, hashedPassword, role], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const userId = results.insertId;

        // Insert into universities table
        const universityQuery = `
        INSERT INTO universities (userId, uniCode, name, email)
        VALUES (?, ?, ?, ?)
      `;

        req.connection.query(universityQuery, [userId, university.uniCode, university.name, university.email], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Fetch the newly created user (university account)
            const fetchQuery = `
          SELECT u.id, u.name, u.email, u.role, uni.uniCode, uni.name AS uniName, uni.email AS uniEmail
          FROM users u
          INNER JOIN universities uni ON u.id = uni.userId
          WHERE u.id = ?
        `;

            req.connection.query(fetchQuery, [userId], (err, userResults) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const userInfo = userResults[0];

                // Create a JWT token
                const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, JWT_SECRET, { expiresIn: '1h' });

                res.status(201).json({
                    user: userInfo,
                    token: token
                });
            });
        });
    });
});

// lấy danh sách tất cả các universities trong bảng universities
router.get('/getAll', (req, res) => {
    const query = 'SELECT * FROM universities';
    req.connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;
