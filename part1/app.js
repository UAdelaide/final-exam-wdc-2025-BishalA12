var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
const fs = require('fs');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let pool;

(async () => {
  try {

    const setup = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
    await setup.query('DROP DATABASE IF EXISTS DogWalkService');
    await setup.query('CREATE DATABASE DogWalkService');
    await setup.end();

    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    const schema = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
    await pool.query(schema);

        await pool.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('diego_walker', 'diego@example.com', 'hashed333', 'walker'),
      ('elena_owner', 'elena@example.com', 'hashed999', 'owner')
    `);

        await pool.query(`
      INSERT INTO Dogs (owner_id, name, size)
      VALUES
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Luna', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'elena_owner'), 'Chico', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Sol', 'small')
    `);

        await pool.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
        ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-12 07:00:00', 55, 'Adelaide Oval', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Chico'), '2025-06-13 18:00:00', 35, 'Parkside Park Lake', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Sol'), '2025-06-14 10:00:00', 20, 'Unley Park', 'cancelled')
    `);

    console.log('Dbase started');
   } catch (err) {
    console.error('Error found with database setup:', err); }}) ();

const indexRouter = require('./routes/index');
app.use('/api', indexRouter);



module.exports = app;