const db = require('../db');
async function db_find_user_by_username(username) {
    const sql = `SELECT * FROM users WHERE username = ?`; 
    const [rows] = await db.execute(sql, [username]); 
    const user = rows[0]; 
    return user ? user : null; 
}
async function db_find_user_by_id(id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    const user = rows[0];
    return user ? user : null;
}
async function db_find_user_by_email(email) {
    const sql = `SELECT * FROM users WHERE email = ?`; 
    const [rows] = await db.execute(sql, [email]); 
    const user = rows[0]; 
    return user ? user : null; 
}
async function db_insert_user(username, email, password, role) {
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`; 
    const [result] = await db.execute(sql, [username, email, password, role]); 
    return result.insertId; 
}
async function db_count_users() {
    const sql = `SELECT COUNT(*) AS count FROM users`; 
    const [rows] = await db.execute(sql); 
    return rows[0].count; 
}


async function db_find_all_users() {
    const sql = `SELECT * FROM users`; 
    const [rows] = await db.execute(sql); 
    return rows; 
}


async function db_update_user_role(userId, newRole) {
    const sql = `UPDATE users SET role = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [newRole, userId]);
    return result.affectedRows > 0;
}


async function db_delete_user(userId) {
    const sql = `DELETE FROM users WHERE id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result.affectedRows > 0;
}


async function verifyPassword(plainPassword, storedPassword) {
    if (!storedPassword) return false;
    return plainPassword === storedPassword;
}

async function db_find_users_by_role(role) {
    const sql = `SELECT * FROM users WHERE role = ?`;
    const [rows] = await db.execute(sql, [role]);
    return rows;
}
module.exports = {
    db_find_user_by_username,
    db_find_user_by_id,
    db_find_user_by_email,
    db_insert_user,
    db_count_users,
    db_find_all_users,
    db_update_user_role,
    db_delete_user,
    verifyPassword,
    db_find_users_by_role,
};