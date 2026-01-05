// School  management system functions for user
const pdo = require('db.js');

async function db_find_user_by_username(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    
    const stmt = await pdo.prepare(sql);

    const [rows] = await stmt.execute([username]);

    const user = rows[0];

<<<<<<< HEAD
    return user;
=======
    return user; user:null;
>>>>>>> 5f28167a840ac769ac545c68f23ae34ab4baf599
}

async function db_find_user_by_email(email) {
    const sql = `SELECT * FROM users WHERE email = ?
    `;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute([email]);
    const user = rows[0];
    return user;
}

<<<<<<< HEAD
async function db_verified_password(password,email) {
    const sql = `SELECT*FROM users where email = ? && password = ?
    `;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute([email])&&([password]);

    const user = rows[0];

    return user; 
}

=======
>>>>>>> 5f28167a840ac769ac545c68f23ae34ab4baf599
async function db_insert_user(username, email, password, role) {
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute([username, email, password, role]);
    const user_id = rows.insertId;
    return user_id;
}

<<<<<<< HEAD

=======
async function db_count_users() {
    const sql = `SELECT COUNT(*) FROM users`;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute();
    const count = rows[0]['COUNT(*)'];
    return count;
}
>>>>>>> 5f28167a840ac769ac545c68f23ae34ab4baf599


   




