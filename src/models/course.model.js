const db = require('../db');

async function db_insert_course(title, description, coeficient, course_hours) {
    const sql = `INSERT INTO courses (title, description, coeficient, course_hours) VALUES (?, ?, ?, ?)`; 
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours]); 
    return result.insertId; 
}

async function db_view_courses() {
    const sql = `SELECT * FROM courses`;
    const [results] = await db.execute(sql);
    return results;
}

async function db_find_course_by_title(title) {
    const sql = `SELECT * FROM courses WHERE title = ?`;
    const [rows] = await db.execute(sql, [title]);
    return rows[0] || null;
}

// ✅ Correction de la syntaxe SQL UPDATE
async function db_edit_course(id, title, description, coeficient, course_hours) {
    const sql = `UPDATE courses SET title = ?, description = ?, coeficient = ?, course_hours = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours, id]);
    return result.affectedRows > 0; // Retourne true si mis à jour
}

async function db_delete_course(id) {
    const sql = `DELETE FROM courses WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
}

// ✅ Ajout de db_find_course_by_title dans les exports (sinon ton contrôleur plantera)
module.exports = {
    db_insert_course,
    db_view_courses,
    db_find_course_by_title,
    db_edit_course,
    db_delete_course    
};
