const express = require('express');
const path = require('path');
require('dotenv').config();
// added the two lines below for 15
const mysql = require('mysql2/promise');

const app = express();

// added the next 11 lines for 15 to make MYSQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

app.use((req, res, next) => {
  req.pool = pool;
  next();
});
// added the above for 15. code attaches pool (mySQL to every incoming request)



// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Code below was added for session set up
const ses = require('express-session');
app.use(ses({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;


