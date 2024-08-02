const express=require("express");
const cors = require('cors')
const dotenv=require("dotenv").config();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
     
const app=express();
app.use(cors())
app.use(bodyParser.json());
const db = require('./configuration/db')

const port = process.env.PORT || 5001;

app.use(express.json());  
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) {
        return res.status(500).send('Database query error: ' + err);
        }
        res.send(results);
        });
});



app.listen( port,()=>{
    console.log(`Server running on the port ${port}`);
});
