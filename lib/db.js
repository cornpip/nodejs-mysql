let mysql = require('mysql');
let db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '980928',
  database: 'opentutorials'
});

module.exports = db;
