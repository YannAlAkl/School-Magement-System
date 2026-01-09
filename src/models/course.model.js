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
   
async function assignCourseToUser(req, res) {
    const sql = `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [req.body.user_id, req.body.course_id]);
    return result.affectedRows > 0;
}

async function showAssignCourseToUser(req, res) {
    try {
        const sql = `SELECT * FROM user_courses WHERE user_id = ?`;
        const [rows] = await db.execute(sql, [req.params.id]);
        return res.render('admin/attributes_course_to_user', {
            user: req.session.user,
            rows: rows,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Erreur lors de l'affichage des attributs du cours à l'utilisateur:", err);
        return res.status(500).render('admin/attributes_course_to_user', {
            user: req.session.user,
            rows: [],
            error: 'Erreur serveur lors du chargement des attributs du cours à l\'utilisateur.',
            success: null,
        });
    }
}

module.exports = {
    db_insert_course,
    db_edit_course,
    db_delete_course,
    db_find_all_courses,
    db_find_course_by_title,
    db_find_course_by_id,
    assignCourseToUser,
    showAssignCourseToUser,
};
