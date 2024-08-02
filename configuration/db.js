// db.js
const mysql = require('mysql');
const dotenv=require("dotenv").config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.db_username, 
  password: process.env.db_password, 
  database: 'hackathon' 
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

module.exports = connection;
