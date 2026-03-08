const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/admin/auth.controllers');

router.get('/login/admin', auth_controller.showLoginAdmin);
router.post('/login/admin', auth_controller.login);
router.post('/login/student', auth_controller.login);

router.get('/register', auth_controller.showRegister);
router.get('/register/admin', auth_controller.showRegister);
router.post('/register/admin', auth_controller.register);
router.get('/register/student', auth_controller.showRegister);
router.post('/register/student', auth_controller.register);
router.get('/logout', auth_controller.logout);

module.exports = router;

