const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
const teacher_controller = require('../controllers/teacher.controller');

router.get('/teacher', requireRole('teacher'), teacher_controller.showDashboard);

module.exports = router;