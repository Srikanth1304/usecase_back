const User = require('../models/user');
const { promisify } = require('util');
const Jobs = require('../models/jobs');
const { genAIReq } = require('../utility/geminiRequest');
const Applications = require('../models/applications');
const pdf = require('pdf-parse');
const db = require('../configuration/db')
const query = promisify(db.query).bind(db);


async function getJobSeekerId(username) {
    try {
      const sql = 'SELECT js_id FROM job_seekers WHERE username = ?';
      const results = await query(sql, [username]);
      console.log(results,sql);
      if (results.length === 0) {
        throw new Error('No such user');
      }
      return results[0].js_id;
    } catch (err) {
      throw new Error('Error retrieving user ID: ' + err.message);
    }
}


async function getResumeById(id){
    try {
        const sql = `select resumee from resumes where js_id = ${id}`;
        const results = await query(sql);
        if (results.length === 0) {
            throw new Error('No such resume');
          }
        return results[0].resumee;
    } catch (error) {
        throw new Error('Error retrieving resume : ' + error.message);
    }
}

async function getResumeText(resumee){
    try {
        let res_text
        res_text = await pdf(resumee)
        return res_text.text
    } catch (error) {
        throw new Error('Error in retrival of resume data'+error.message)
    }
}

async function getJobDescription(job_id){
    try {
        const sql = 'select job_desc from jobs where job_id = ?';
        const results = await query(sql,[job_id]);
        if (results.length === 0) {
            throw new Error('No such job');
          }
        return results[0].job_desc;
    } catch (error) {
        throw new Error('Error retrieving Job Description: ' + error.message);
    }
}


async function generateScore(resumeText,job_desc){
    try {
        const prompt = `
      You are an intelligent AI assistant designed to extract some data from the given resume based on the job description and assign a score for the resume.
      You are given a job description which contains all the requirements and a resume of a candidate. You have to extract user skills and matched skills from the resume and generate a score based on the resume.
      The score should be calculated by comparing the matched skills with the required skills out of 10.
      For example, if the number of required skills mentioned in the job description are 5 and the number of matched skills are 4, then the score = (4/5)*10.
      You can give a decimal value between 1 to 10.

      Please provide the output in a JSON object format as mentioned below:
      {
        "Name": " ",
        "Email": " ",
        "Contact_Info": {
          "Phone_No": ,
          "LinkedIn": (if available),
          "Github": (if available)
        },
        "User_Skills":[" ", " ", ... ],
        "Required_skills": [" ", " ", ... ],
        "Matched_skills": [" ", " ", ...],
        "Score": 
      }

      Below is the text from the resume from which the required data is to be extracted and score is calculated.

      Here, is the job description:
      "Job_description": ${job_desc}

      Below is the resume data:
      resume_data: ${resumeText}

      Analyse the above resume data and generate an accurate score and give the output in the format mentioned above.

      Dont use any kind of back ticks and text only return json formatted text
    `;
    return genAIReq(prompt)
    } catch (error) {
        throw new Error('Error getting request from gemini: ' + error.message);
    }
}


async function storeScore(job_id,js_id,score,user_skills){
    try {
        const sql = 'insert into applications values(?,?,?,?,?)';
        let skills = ""
        for(let skill in user_skills){
            skills += user_skills[skill]+"," 
        }
        // console.log(skills)
        const results = await query(sql,[job_id,js_id,score,"Applied",skills]);
    } catch (error) {
        console.log(error)
    }
}

async function getSkills(job_id,js_id){
    try {
        const sql = `select skills from applications where job_id = ${job_id} and js_id = ${js_id}`
        const results = await query(sql);
        if(results.length[0] == 0){
            throw new Error('Invalid user');
        }
        console.log(results[0].skills)
        return results[0].skills;
    } catch (error) {
        
    }
}

const applyJob = async (req, res) => {
  const { username, job_id } = req.body;
  try {
    const js_id = await getJobSeekerId(username);
    const resumee = await getResumeById(js_id);
    const resume_data = await getResumeText(resumee)
    const job_desc = await getJobDescription(job_id)
    const score = await generateScore(resume_data,job_desc);
    const obj = JSON.parse(score); 
    // console.log(obj)
    // console.log(obj['Score']);
    storeScore(job_id,js_id,obj['Score'],obj['User_Skills'])
    res.send("Applied Successfully")
  } catch (err) {
    res.status(500).send('Error in applying for job: ' + err.message);
  }
};




const getQuestions = async(req,res) => {
    const {difficulty,job_id,js_id} = req.body;
    try {
        const skills = await getSkills(job_id,js_id);
        let prompt
        if(difficulty == 1){
            prompt = `
        You are an intelligent AI assistant designed to interview a person based on their skills. You are given the data about the technical skills of a person. You have to ask 10 basic difficulty level questions.
Note: All the mentioned skills should be covered in the questions. Don’t repeat the questions.
Skills: ${skills}
Please provide the output in the following format:
{
  "1": " ",
  "2": " ",
  "3": " ",
  "4": " ",
  "5": " ",
  "6": " ",
  "7": " ",
  "8": " ",
  "9": " ",
  "10": " "
}

Dont use any kind of back ticks and text only return json formatted text
        `
        }
        else if(difficulty == 2){
            prompt = `
            You are an intelligent AI assistant designed to interview a person based on their skills. You are given the data about the technical skills of a person. You have to ask 10 intermediate difficulty level questions.
Note: 
1. All the mentioned skills should be covered in the questions.
2. Add one logical question
3. Don’t repeat the questions
Skills: ${skills}
Please provide the output in the following format:
{
  "1": " ",
  "2": " ",
  "3": " ",
  "4": " ",
  "5": " ",
  "6": " ",
  "7": " ",
  "8": " ",
  "9": " ",
  "10": " "
}
  Dont use any kind of back ticks and text only return json formatted text
            `
        }
        else{
            prompt = `
            You are an intelligent AI assistant designed to interview a person based on their skills. You are given the data about the technical skills of a person. You have to ask 10 hard difficulty level questions.
Note: 
1. All the mentioned skills should be covered in the questions.
2. Add one coding/programming question of intermediate level.
3. Don’t repeat the questions
Skills: ${skills}
Please provide the output in the following format:
{
  "1": " ",
  "2": " ",
  "3": " ",
  "4": " ",
  "5": " ",
  "6": " ",
  "7": " ",
  "8": " ",
  "9": " ",
  "10": " "
}
  Dont use any kind of back ticks and text only return json formatted text
            `
        }
        // console.log(prompt)
        const ai_response = await genAIReq(prompt)
        // console.log(ai_response)
        const questions = JSON.parse(ai_response)
        res.send(questions)
    } catch (error) {
        console.log(error)
    }
}


const evaluateAnswers = async (req,res)=>{
    const {questions,answers} = req.body;
    queArray = []
    ansArray = []
    for(let i = 0; i < 10; i++){
        queArray.push(questions[`${i}`])
    }
    for(let i = 0; i < 10; i++){
        ansArray.push(answers[`${i}`])
    }
    console.log(questions)
    console.log(answers)
    try {
        const prompt = `
        You are an intelligent AI evaluator. You are given some questions and answers for those questions. Evaluate the answers and generate a score out of 10. If an answer for a particular question is correct, assign a score of 1 for that question. If the answer is partially correct, assign a score of a decimal value between 0 and 1 based on the accuracy. At the end, provide the total score out of 10 and the number of correct and wrong responses.
Below is the information about the questions and answers:
Questions and answers will be in JSON format and it will be sent to you through letiables.
The question and answers are 
{
"Questions":
    ${queArray}
,
"Answers":
    ${ansArray}   

}

Please provide the output in the following format:
The Total_Score you need to give is average score of all the questions
{
  "Total_Score": ,
  "Number_of_Correct_Responses": ,
  "Number_of_Wrong_Responses": ,
  "Detailed_Scores": {
    "1": ,
    "2": ,
    "3": ,
    "4": ,
    "5": ,
    "6": ,
    "7": ,
    "8": ,
    "9": ,
    "10": 
  }
}

Dont use any kind of back ticks and text only return json formatted text
        `
        const ai_response = await genAIReq(prompt)
        console.log(ai_response)
        const result = JSON.parse(ai_response)
        res.send(result)

    } catch (error) {
        console.log(error)
    }
}


const getJobs = (req,res) => {
    Jobs.getJobs((err,results)=>{
        if(err){
            res.send("Error in getting job",err)
        }
        res.send(results)
    })
}


const getDetails = async(req,res) => {
    const {username}=req.body
    const js_id = await getJobSeekerId(username);
    const query = "select * from applications join jobs on applications.job_id=jobs.job_id where applications.js_id=?;";
    db.query(query,[js_id],(err, results) => {
      if (err) {
        return res.status(500).send('Error fetching data from database');
      }
      res.status(200).json(results);
    });
  }

const getProfileDetails = async(req, res) => {
  const {username} = req.headers
  const js_id = await getJobSeekerId(username);
  const query = "select * from job_seekers where js_id=?;";
    db.query(query,[js_id],(err, results) => {
      if (err) {
        return res.status(500).send('Error fetching data from database');
      }
      res.status(200).json(results);
    });
}


module.exports = {
  applyJob,
  getJobs,
  getDetails,
  getQuestions,
  evaluateAnswers,
  getProfileDetails
};
