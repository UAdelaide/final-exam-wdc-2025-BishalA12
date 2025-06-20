var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

router.use((req, res, next) => {
  req.pool = req.app.locals.pool;
  next();
});

router.get('/dogs', (req, res) => {
  req.pool.query(`
    SELECT d.name AS dog_name, d.size, u.username AS owner_username
    FROM Dogs d
    JOIN Users u ON d.owner_id = u.user_id
  `)
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(err => {
    console.error('Error in /api/dogs:', err);
    res.status(500).json({ error: 'couldnt fetch dogs' });
  });
});

router.get('/walkrequests/open', (req, res) => {
  req.pool.query(`
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
    console.error('Mistake in /api/walkrequests/open:', err);
    res.status(500).json({ error: 'Couldnd not get walk requests' });
  });
});

router.get('/walkers/summary', (req, res) => {
  req.pool.query(`
    SELECT
      u.username AS walker_username,
      COUNT(r.rating_id) AS total_ratings,
      ROUND(AVG(r.rating), 2) AS average_rating,
      (
        SELECT COUNT(*)
        FROM WalkApplications wa
        JOIN WalkRequests wr ON wa.request_id = wr.request_id
        WHERE wa.walker_id = u.user_id AND wr.status = 'completed'
      ) AS completed_walks
    FROM Users u
    LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
    WHERE u.role = 'walker'
    GROUP BY u.username
  `)
  .then(([rows]) => {
    res.json(rows);
  })
  .catch(err => {
    console.error('mistake in /api/walkers/summary:', err);
    res.status(500).json({ error: 'could not fetch walker summaries' });
  });
});



module.exports = router;
