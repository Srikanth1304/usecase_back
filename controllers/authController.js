const db = require('../configuration/db');
const multer = require('multer');
const fs = require('fs');
const User = require('../models/user')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('resumee');

const register = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(500).send('Error uploading file: ' + err);
      }
  
      const {
        username, password, email, phone, firstname, lastname, city, github, linkedin
      } = req.body;
  
      const resumee = req.file ? req.file.buffer : null;
  
      User.createJobSeeker({ username, password, email, phone, firstname, lastname, city, github, linkedin }, (err, results) => {
        if (err) {
          return res.status(500).send('Error registering user: ' + err);
        }
  
        const jobSeekerId = results.insertId;
  
        if (resumee) {
          User.createResume(jobSeekerId, resumee, (err, results) => {
            if (err) {
              return res.status(500).send('Error saving resume: ' + err);
            }
            res.status(201).send('User registered and resume saved successfully');
          });
        } else {
          res.status(201).send('User registered successfully');
        }
      });
    });
  };



const login = (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM job_seekers WHERE username = ?';
  db.query(sql, [username], (err,results)=>{
    if(err){
        return res.status(500).send('Error logging in: ' + err);
    }
    if (results.length === 0 || results[0].password !== password) {
        return res.status(401).send('Invalid username or password');
    }
    res.send("Login Successful")
  });
};

module.exports = {
  register,
  login
};
