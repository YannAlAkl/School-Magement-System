const db = require('../db');

async function db_insert_course(title, description, coeficient, course_hours, ccreate_at, course_price) {
    const sql = `INSERT INTO courses (title, description, coeficient, course_hours, ccreate_at, course_price) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours, ccreate_at, course_price]);
    return result.insertId;
}

async function db_edit_course(id, title, description, coeficient, course_hours , ccreate_at, course_price) {
    const sql = `UPDATE courses SET title = ?, description = ?, coeficient = ?, course_hours = ?, ccreate_at = ?, course_price = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [title, description, coeficient, course_hours, ccreate_at, course_price, id]);
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

// Enrolment functions
async function db_addEnrolment(student_username, course_title, enroll_status, enroll_date) {
    const sql = `INSERT INTO enrolment (student_username, course_title, enroll_status, enroll_date) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [student_username, course_title, enroll_status, enroll_date]);
    return result.insertId;
}

async function db_editEnrolment(enrolment_id, student_id, student_username, course_title, enroll_status, enroll_date) {
    const sql = `UPDATE enrolment SET student_username = ?, course_title = ?, enroll_status = ?, enroll_date = ? WHERE enrolment_id = ?`;
    const [result] = await db.execute(sql, [student_username, course_title, enroll_status, enroll_date, enrolment_id]);
    return result.affectedRows > 0;
}

async function db_deleteEnrolment(enrolment_id) {
    const sql = `DELETE FROM enrolment WHERE enrolment_id = ?`;
    const [result] = await db.execute(sql, [enrolment_id]);
    return result.affectedRows > 0;
}

async function db_findEnrolmentsByCourse(course_title) {
    const sql = `SELECT * FROM enrolment WHERE course_title = ?`;
    const [rows] = await db.execute(sql, [course_title]);
    return rows;
}

async function db_findEnrolmentsByUser(student_username) {
    const sql = `SELECT * FROM enrolment WHERE student_username = ?`;
    const [rows] = await db.execute(sql, [student_username]);
    return rows;
}

// Payment functions
async function db_addPayment(student_username, course_title, amount, currency, method, payment_date, status, reference, note) {
    const sql = `INSERT INTO payments (student_username, course_title, amount, currency, method, payment_date, status, reference, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [student_username, course_title, amount, currency, method, payment_date, status, reference, note]);
    return result.insertId;
}

async function db_editPayment(payment_id, student_username, course_title, amount, currency, method, payment_date, status, reference, note) {
    const sql = `UPDATE payments SET student_username = ?, course_title = ?, amount = ?, currency = ?, method = ?, payment_date = ?, status = ?, reference = ?, note = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [student_username, course_title, amount, currency, method, payment_date, status, reference, note, payment_id]);
    return result.affectedRows > 0;
}

async function db_deletePayment(payment_id) {
    const sql = `DELETE FROM payments WHERE id = ?`;
    const [result] = await db.execute(sql, [payment_id]);
    return result.affectedRows > 0;
}

async function db_showAllPaymentsByUsername(student_username) {
    const sql = `SELECT * FROM payments WHERE student_username = ? ORDER BY payment_date DESC`;
    const [rows] = await db.execute(sql, [student_username]);
    return rows;
}

async function db_showAllPaymentsByCourse(course_title) {
    const sql = `SELECT * FROM payments WHERE course_title = ? ORDER BY payment_date DESC`;
    const [rows] = await db.execute(sql, [course_title]);
    return rows;
}

async function db_calculateStudentTotalAmount(student_username) {
    const sql = `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE student_username = ?`;
    const [rows] = await db.execute(sql, [student_username]);
    return rows[0]?.total || 0;
}

async function db_getEnrollmentPageData() {
    const users = await require('../models/user.model').db_find_all_users();
    const courses = await db_find_all_courses();
    const enrolments = await db_find_all_enrolments();
    const payments = await db_show_all_payments();
    
    return {
        students: users.filter(u => u.role === 'student'),
        courses: courses,
        enrolments: enrolments,
        payments: payments
    };
}

async function db_find_all_enrolments() {
    const sql = `SELECT * FROM enrolment`;
    const [rows] = await db.execute(sql);
    return rows;
}

async function db_show_all_payments() {
    const sql = `SELECT * FROM payments ORDER BY payment_date DESC`;
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
    db_addEnrolment,
    db_editEnrolment,
    db_deleteEnrolment,
    db_findEnrolmentsByCourse,
    db_findEnrolmentsByUser,
    db_addPayment,
    db_editPayment,
    db_deletePayment,
    db_showAllPaymentsByUsername,
    db_showAllPaymentsByCourse,
    db_calculateStudentTotalAmount,
    db_getEnrollmentPageData
};
