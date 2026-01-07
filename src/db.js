const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',                  
    user: 'root',                       
    password: '',                      
    database: 'school_management_system', 
    port: 3306,                         
    waitForConnections: true,           
    connectionLimit: 10                 
});
module.exports = pool;
