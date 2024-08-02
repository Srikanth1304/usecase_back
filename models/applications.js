const db = require('../configuration/db');

const Applications = {
    applyJob: (job_id,js_id,score,callback)=>{
        const sql = `insert into applications(job_id, js_id, score, status) values(?,?,?,?)`
        db.query(sql,[job_id,js_id,score,"Applied"],callback)
    }
}

module.exports = Applications