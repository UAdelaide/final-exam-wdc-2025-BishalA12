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
    await setup.query('DROP DATABASE IF EXISTS DogWalksDatabase');
    await setup.query('CREATE DATABASE DogWalksDatabase');
    await setup.end();

    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalksDatabase'
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

    

}
};



module.exports = app;