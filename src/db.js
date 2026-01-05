// connectiona to the database
function db_connect() {
    const mysql = require('mysql2/promise');
    const connection = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'school_management_system',
        port: 3306,
    });
    return connection;
}

module.exports = db_connect();
