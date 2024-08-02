// routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../configuration/db')
const userController = require('../controllers/userController');

router.post('/applyJob', userController.applyJob);
router.get('/getJobs', userController.getJobs);
router.post('/getApplications', userController.getDetails);
router.post('/getQuestions', userController.getQuestions);
router.post('/evaluateAnswers', userController.evaluateAnswers);
router.get('/getProfileDetails', userController.getProfileDetails);



module.exports = router;
