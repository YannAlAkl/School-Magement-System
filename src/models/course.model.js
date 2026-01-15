const db = require('../db');
async function db_insert_course(title, description, coeficient, course_hours) {
    const sql = `INSERT INTO courses (title, description, coeficient, course_hours) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours]);
    return result.insertId; 
}

async function db_edit_course(id, title, description, coeficient, course_hours) {
    const sql = `UPDATE courses SET title = ?, description = ?, coeficient = ?, course_hours = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours, id]);
    return result.affectedRows > 0; 
}

async function db_delete_course(id) {
    const sql = `DELETE FROM courses WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
}
async function db_find_all_courses() {
    const sql = `SELECT * FROM courses`;
    const [rows] = await db.execute(sql);
    return rows;
}
async function db_find_course_by_title(title) {
    const sql = `SELECT * FROM courses WHERE title = ?`;
    const [rows] = await db.execute(sql, [title]);
    return rows[0] || null;
}
async function db_find_course_by_id(id) {
    const sql = `SELECT * FROM courses WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
}
   
async function db_assignCourseToUser(user_id,course_id) {
    const sql = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [user_id, course_id]);
    return result.affectedRows > 0;
}

async function db_showAssignCourseToUser(user_id) {
    const sql = `SELECT * FROM user_courses WHERE user_id = ?`;
    const [rows] = await db.execute(sql, [user_id]);
    return rows;
}
   

async function db_find_all_assigned_courses() {
    const sql = `
        SELECT
            uc.user_id,
            u.username,
            c.title AS course_title,
            c.coeficient,
            c.course_hours
        FROM user_courses uc
        JOIN users u ON uc.user_id = u.id
        JOIN courses c ON uc.course_id = c.id
        ORDER BY uc.user_id, c.title
    `;
    const [rows] = await db.execute(sql);
    return rows;
}



module.exports = {
    db_insert_course,
    db_edit_course,
    db_delete_course,
    db_find_all_courses,
    db_find_course_by_title,
    db_find_course_by_id,
    db_assignCourseToUser,
    db_showAssignCourseToUser,
    db_find_all_assigned_courses,
};
