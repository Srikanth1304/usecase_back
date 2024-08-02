// models/user.js
const db = require('../configuration/db');

const User = {
  createJobSeeker: (userData, callback) => {
    const sql = `
      INSERT INTO job_seekers (username, password, email, phone, firstname, lastname, city, github, linkedin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { username, password, email, phone, firstname, lastname, city, github, linkedin } = userData;
    db.query(sql, [username, password, email, phone, firstname, lastname, city, github, linkedin], callback);
  },

  createResume: (jobSeekerId, resumee, callback) => {
    const sql = `
      INSERT INTO resumes (js_id, resumee)
      VALUES (?, ?)
    `;
    db.query(sql, [jobSeekerId, resumee], callback);
  },

  findByUsername: function(username) {
    let id
    const sql = 'SELECT js_id FROM job_seekers WHERE username = ?';
    db.query(sql, [username],(err,results)=>{
      id = results[0]
    });
    return id;
  },

  getResumeByJobSeekerId: (jobSeekerId, callback) => {

    const sql = 'SELECT resumee FROM resumes WHERE js_id = ?';
    db.query(sql, [jobSeekerId], callback);
  }
};

module.exports = User;
