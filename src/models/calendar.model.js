const db = require('../db');
async function db_insert_event(title, description, date, time, status) {
    const sql = `INSERT INTO events (title, description, date, time, status) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [title, description, date, time, status]);
    return result.insertId; 
}

async function db_edit_event(id, title, description, date, time, status) {
    const sql = `UPDATE events SET title = ?, description = ?, date = ?, time = ?, status = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [title, description, date, time, status, id]);
    return result.affectedRows > 0; 
}

async function db_delete_event(id) {
    const sql = `DELETE FROM events WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
}
async function db_find_all_events() {
    const sql = `SELECT * FROM events`;
    const [rows] = await db.execute(sql);
    return rows;
}
async function db_find_event_by_title(title) {
    const sql = `SELECT * FROM events WHERE title = ?`;
    const [rows] = await db.execute(sql, [title]);
    return rows[0] || null;
}
async function db_find_event_by_id(id) {
    const sql = `SELECT * FROM events WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
}

module.exports = {
    db_insert_event,
    db_edit_event,
    db_delete_event,
    db_find_all_events,
    db_find_event_by_title,
    db_find_event_by_id,
};