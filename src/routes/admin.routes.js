const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
const admin_controller = require('../controllers/admin.controller');

router.use(requireRole('admin'));
router.get('/admin', admin_controller.showDashboard);
router.get('/admin/users/add', admin_controller.showAddUserForm);
router.post('/admin/users/add', admin_controller.addUser);
router.post('/admin/users/delete/:id', admin_controller.deleteUser);
router.get('/admin/users/edit-role/:id', admin_controller.showEditUserRoleForm);
router.post('/admin/users/edit-role/:id', admin_controller.editUserRole);
module.exports = router;
