const db = require('../configuration/db');

const Jobs = {
    getJobs: (callback) => {
      const sql = `SELECT * FROM jobs`;
      db.query(sql, callback);
    }
}

module.exports = Jobs