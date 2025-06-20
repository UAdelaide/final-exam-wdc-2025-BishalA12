var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'DogWalksDatabase'
});










module.exports = router;
