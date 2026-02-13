const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
const admin_controller = require('../controllers/admin.controller');

router.use(requireRole('admin'));

// principal admin route
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// Dashboard ✅
router.get('/dashboard', admin_controller.showDashboard);

// Users
router.get('/users', admin_controller.showAllUsers);
router.get('/users/add', admin_controller.showAddUserForm);
router.get('/users/:username', admin_controller.showUserByUsername);
router.post('/users/add', admin_controller.addUser);
router.post('/users/delete/:id', admin_controller.deleteUser);
router.post('/users/edit-role', admin_controller.editUserRole);
// Courses
router.get('/courses', admin_controller.showAllCourses);
router.get('/courses/:title', admin_controller.showCourseByTitle);
router.post('/courses/add', admin_controller.addCourse);
router.post('/courses/edit/:id', admin_controller.editCourse);
router.post('/courses/delete/:id', admin_controller.deleteCourse);


// enrollment
router.get('/enrolment/by-username/:username', admin_controller.showEnrolmentByUsername);
router.get('/enrolment/by-course/:title', admin_controller.showEnrolmentByCourse);
router.post('/enrolment/add', admin_controller.addEnrolment);
router.post('/enrolment/edit', admin_controller.editEnrolment);
router.post('/enrolment/delete', admin_controller.deleteEnrolment);

// Payments
router.get('/payments/by-username/:username', admin_controller.showPaymentsByUsername);
router.get('/payments/by-course/:title', admin_controller.showPaymentsByCourse);
router.post('/payments/add', admin_controller.addPayment);
router.post('/payments/edit', admin_controller.editPayment);
router.post('/payments/delete', admin_controller.deletePayment);

// Events
router.get('/calendar', admin_controller.showcalendar);
router.get('/calendar/edit/:id', admin_controller.showEditEvent);
router.post('/calendar/add', admin_controller.addEvent);
router.post('/calendar/edit/:id', admin_controller.editEvent);
router.post('/calendar/delete/:id', admin_controller.deleteEvent);

// Others
router.get('/students/total-amount/:username', admin_controller.getStudentTotalAmount);
router.get('/enrolment', admin_controller.showEnrolmentPaiement);

module.exports = router;
