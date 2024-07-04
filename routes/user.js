const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticate');
// Secret key for JWT
const JWT_SECRET = 'dacnpm';

// Create a new user
// Create a new user and generate JWT token
router.post('/register', async (req, res) => {
  const user = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(user.password, 10);

  // Always set role to "student"
  const role = 'student';

  const query = `
    INSERT INTO users (name, studentId, email, password, role, universityId)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  req.connection.query(query, [user.name, user.studentId, user.email, hashedPassword, role, user.universityId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const insertedId = results.insertId;

    // Fetch the newly created user
    const fetchQuery = 'SELECT id, name, studentId, email, role, universityId, createdAt FROM users WHERE id = ?';
    req.connection.query(fetchQuery, [insertedId], (err, userResults) => {
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

// Example of a protected route using middleware
router.get('/profile', authenticateToken, (req, res) => {
  // req.user contains the decoded JWT payload
  const userId = req.user.id;

  // Fetch user profile from database
  const query = 'SELECT id, name, studentId, email, role, universityId, createdAt FROM users WHERE id = ?';
  req.connection.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

module.exports = router;


