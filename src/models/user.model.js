// School  management system functions for user
const pdo = require('db.js');

async function db_find_user_by_username(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    
    const stmt = await pdo.prepare(sql);

    const [rows] = await stmt.execute([username]);

    const user = rows[0];

    return user; user:null;
}

async function db_find_user_by_email(email) {
    const sql = `SELECT * FROM users WHERE email = ?
    `;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute([email]);
    const user = rows[0];
    return user;
}

async function db_insert_user(username, email, password, role) {
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute([username, email, password, role]);
    const user_id = rows.insertId;
    return user_id;
}

async function db_count_users() {
    const sql = `SELECT COUNT(*) FROM users`;
    const stmt = await pdo.prepare(sql);
    const [rows] = await stmt.execute();
    const count = rows[0]['COUNT(*)'];
    return count;
}


   




