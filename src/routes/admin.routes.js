const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
const admin_controller = require('../controllers/admin.controller');

router.use(requireRole('admin'));
router.get('/admin', admin_controller.showDashboard);
router.get('/admin/users/add', admin_controller.showAddUser);
router.post('/admin/users/add', admin_controller.addUser);
router.post('/admin/users/delete/:id', admin_controller.deleteUser);
router.get('/admin/users/edit-role/:id', admin_controller.showEditUserRole);
router.post('/admin/users/edit-role/:id', admin_controller.editUserRole);
router.get('/admin/courses', admin_controller.showCourses);
router.post('/admin/courses/assign/:id', admin_controller.assignCourseToUser);
router.get('/admin/courses/assign/:id', admin_controller.showAssignCourseToUser);
router.get('/admin/courses/add', admin_controller.showCourses);
router.post('/admin/courses/add', admin_controller.addCourse);
router.post('/admin/courses/delete/:id', admin_controller.deleteCourse);
router.get('/admin/courses/edit/:id', admin_controller.showEditCourse);
router.post('/admin/courses/edit/:id', admin_controller.editCourse);
router.get('/admin/enrolement/payement', admin_controller.showEnrolementPayement);


module.exports = router;
