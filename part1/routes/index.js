var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'DogWalksDatabase'
});

router.get('/dogs', (req, res) => {
  pool.query(`
    SELECT d.name AS dog_name, d.size, u.username AS owner_username
    FROM Dogs d
    JOIN Users u ON d.owner_id = u.user_id
  `)
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(err => {
    res.status(500).json({ error: 'couldnt fetch dogs' });
  });
});










module.exports = router;
