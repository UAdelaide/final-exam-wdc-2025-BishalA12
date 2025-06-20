const express = require('express');
const router = express.Router();
const db = require('../models/db');


// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version) was modified to use username, not email.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Try again' });
    }
    const user = rows[0];
    req.session.user = { id: user.user_id, role: user.role };
    const redirectPath = user.role === 'owner'
      ? '/owner-dashboard.html'
      : '/walker-dashboard.html';
    res.json({ redirect: redirectPath });
  } catch (err) {
    res.status(500).json({ error: 'Login did not work' });
  }
});
// code below added for logout function
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout did not happen' });
    }
    res.clearCookie('connect.sid'); /* remove cookie */
    res.json({ message: 'You are logged out' });
  });
});

/* added the following below for 15.  */
/* The code below returns list of dogs of the logged in owner */

router.get('/the-dogs', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(401).json({ error: 'Not authorized' });
  }

  req.pool.query(
    `SELECT dog_id, name FROM Dogs WHERE owner_id = ?`,
    [req.session.user.id]
  )
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(err => {
    res.status(500).json({ error: 'Could not load the dogs' });
  });
});






module.exports = router;

