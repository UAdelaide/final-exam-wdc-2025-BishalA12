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

router.get('/walkrequests/open', (req, res) => {
  pool.query(`
    SELECT wr.request_id, d.name AS dog_name, wr.requested_time,
           wr.duration_minutes, wr.location, u.username AS owner_username
    FROM WalkRequests wr
    JOIN Dogs d ON wr.dog_id = d.dog_id
    JOIN Users u ON d.owner_id = u.user_id
    WHERE wr.status = 'open'
  `)
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(err => {
    res.status(500).json({ error: 'Couldnd not get walk requests' });
  });
});








module.exports = router;
