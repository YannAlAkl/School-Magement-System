// School management system functions for user
const db = require('../db');

// optional bcrypt (if installed). If not installed, fallback to plain compare.
let bcrypt = null;
try {
    bcrypt = require('bcrypt');
} catch (e) {
    bcrypt = null;
}

async function db_find_user_by_username(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await db.execute(sql, [username]);
    const user = rows[0];
<<<<<<< HEAD

    return user;
=======
    return user ? user : null;
>>>>>>> c2508509f2295e9fdbde07ee8a9af20451ca4991
}

async function db_find_user_by_email(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    const user = rows[0];
    return user ? user : null;
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

>>>>>>> c2508509f2295e9fdbde07ee8a9af20451ca4991
async function db_insert_user(username, email, password, role) {
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [username, email, password, role]);
    return result.insertId;
}
<<<<<<< HEAD
=======

>>>>>>> c2508509f2295e9fdbde07ee8a9af20451ca4991
async function db_count_users() {
    const sql = `SELECT COUNT(*) AS count FROM users`;
    const [rows] = await db.execute(sql);
    return rows[0].count;
}
<<<<<<< HEAD


   
=======
>>>>>>> c2508509f2295e9fdbde07ee8a9af20451ca4991

async function verifyPassword(plainPassword, storedPassword) {
    if (!storedPassword) return false;

    // If bcrypt exists and password looks hashed, compare with bcrypt
    if (bcrypt && typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
        return await bcrypt.compare(plainPassword, storedPassword);
    }

    // fallback (simple project): direct compare
    return plainPassword === storedPassword;
}

module.exports = {
    db_find_user_by_username,
    db_find_user_by_email,
    db_insert_user,
    db_count_users,
    verifyPassword
};