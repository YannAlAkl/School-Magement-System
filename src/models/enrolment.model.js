const db = require('../db');
const User = require('./user.model');
const Course = require('./course.model');



async function db_addEnrolment(student_username, course_title, enroll_status, enroll_date) {
    const sql = `
        INSERT INTO enrolment (student_username, course_title, enroll_status, enroll_date) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [ student_username,course_title,enroll_status,enroll_date]);
    return result.insertId;
}

async function db_editEnrolment(enrolment_id, student_username, course_title, enroll_status, enroll_date) {
    const sql = `UPDATE enrolment SET  student_username = ?, course_title = ?, enroll_status = ?, enroll_date = ? WHERE enrolment_id = ?`;
    const [result] = await db.execute(sql, [student_username, course_title, enroll_status, enroll_date, enrolment_id]);
    return result.affectedRows > 0;
}

async function db_deleteEnrolment(enrolment_id) {
    const sql = `DELETE FROM enrolment WHERE enrolment_id = ?`;
    const [result] = await db.execute(sql, [enrolment_id]);
    return result.affectedRows > 0;
}

async function db_showAllEnrolements() {
    const sql = `SELECT * FROM enrolments`;
    const [rows] = await db.execute(sql);
    return rows;
}   


async function db_findEnrolementsByUser(student_username) {
    const sql = `SELECT * FROM enrolments WHERE student_username = ?`;
    const [rows] = await db.execute(sql, [student_username]);
    return rows;
}

async function db_findEnrolementsByCourse(course_title) {
    const sql = `SELECT * FROM enrolments WHERE course_title = ?`;
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

async function db_showAllPaymentsByUsername(student_username) {
    const sql = `SELECT * FROM payments WHERE student_username = ? ORDER BY payment_date DESC`;
    const [rows] = await db.execute(sql, [student_username]);
    return rows;

}

async function db_showAllPayments() {
    const sql = `SELECT * FROM payments ORDER BY payment_date DESC`;
    const [rows] = await db.execute(sql);
    return rows;
}

async function db_findPaymentByUsername(payment_id) {
    const sql = `SELECT * FROM payments WHERE id = ?`;
    const [rows] = await db.execute(sql, [payment_id]);
    return rows[0];
}




async function db_calculateStudentTotalAmount(student_username) {

    const sqlEnrollments = `SELECT course_title FROM enrolments WHERE student_username = ? AND enroll_status = 'active'`;
    const enrollments = await db.query(sqlEnrollments, [student_username]);

    const sqlCourses = `SELECT title, course_price FROM courses`;
    const courses = await db.query(sqlCourses);

    let total = 0;

    enrollments.forEach(enrol => {
        const course = courses.find(c => c.title === enrol.course_title);
        if (course) {
            total += Number(course.course_price);
        }
    });

    return total;
}

async function db_getEnrollmentPageData() {
    try {
        // 1️⃣ Get all users
        const allUsers = await User.db_find_all_users();

        // 2️⃣ Filter only students
        const students = allUsers.filter(user => user.role === 'student');

        // 3️⃣ Get all courses
        const courses = await Course.db_find_all_courses();

        // 4️⃣ Get enrolments
        const enrolmentSql = `
            SELECT 
                enrolment_id,
                student_username,
                course_title,
                enroll_status,
                enroll_date
            FROM enrolments
            ORDER BY enroll_date DESC
        `;
        const [enrolments] = await db.execute(enrolmentSql);

        // 5️⃣ Get all payments
        const paymentsSql = `
            SELECT *
            FROM payments
            ORDER BY payment_date DESC
        `;
        const [payments] = await db.execute(paymentsSql);

        return {
            students,
            courses,
            enrolments,
            payments
        };
    } catch (error) {
        console.error('❌ Error fetching enrollment page data:', error);
        throw error;
    }
}
module.exports = {
    db_addEnrolment,
    db_findEnrolementsByUser,
    db_findEnrolementsByCourse,
    db_addPayment,
    db_editEnrolment,
    db_deleteEnrolment,
    db_showAllEnrolements,
    db_editPayment,
    db_deletePayment,
    db_showAllPaymentsByUsername,
    db_showAllPayments,
    db_findPaymentByUsername,
    db_calculateStudentTotalAmount,
    db_getEnrollmentPageData,
};
