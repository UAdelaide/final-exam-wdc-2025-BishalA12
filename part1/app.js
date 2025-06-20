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


}
};



module.exports = app;