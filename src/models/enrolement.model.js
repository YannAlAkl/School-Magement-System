async function db_addEnrolement(student_id, student_username, course_title, enroll_status, enroll_date) {
    const sql = `INSERT INTO enrolements (student_id, student_username, course_title, enroll_status, enroll_date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [student_id, student_username, course_title, enroll_status, enroll_date]);
    return result.insertId;
}

async function db_editEnrolement(enrolment_id, student_id, student_username, course_title, enroll_status, enroll_date) {
    const sql = `UPDATE enrolements SET student_id = ?, student_username = ?, course_title = ?, enroll_status = ?, enroll_date = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [student_id, student_username, course_title, enroll_status, enroll_date, enrolment_id]);
    return result.affectedRows > 0;
}

async function db_deleteEnrolement(enrolment_username) {
    const sql = `DELETE FROM enrolements WHERE student_username = ?`;
    const [result] = await db.execute(sql, [enrolment_username]);
    return result.affectedRows > 0;
}

async function db_showAllEnrolements() {
    const sql = `SELECT * FROM enrolements`;
    const [rows] = await db.execute(sql);
    return rows;
}   


async function db_findEnrolementsByUser(user_usename) {
    const sql = `SELECT * FROM enrolements WHERE user_username = ?`;
    const [rows] = await db.execute(sql, [user_usename]);
    return rows;
}

async function db_findEnrolementsByCourse(course_title) {
    const sql = `SELECT * FROM enrolements WHERE course_title = ?`;
    const [rows] = await db.execute(sql, [course_title]);
    return rows;
}

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
module.exports = {
    db_addEnrolement,
    db_findEnrolementsByUser,
    db_findEnrolementsByCourse,
    db_addPayment,
    db_editEnrolement,
    db_deleteEnrolement,
    db_showAllEnrolements,
    db_editPayment,
    db_deletePayment,
};