// models/user.js
const db = require('../configuration/db');

const User = {
  createRecruiter: (userData, callback) => {
    const sql = `
      INSERT INTO recruiters (username, password, email, phone, firstname, lastname, city, github, linkedin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { username, password, email, phone, companyname } = userData;
    db.query(sql, [username, password, email, phone, firstname, lastname, city, github, linkedin], callback);
  },

  findByUsername: (username, callback) => {
    const sql = 'SELECT * FROM job_seekers WHERE username = ?';
    db.query(sql, [username], callback);
  }
};

module.exports = User;
