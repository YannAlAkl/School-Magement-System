const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth.controllers');

router.get('/login', auth_controller.showLogin);
router.post('/login', auth_controller.login);

router.get('/register', auth_controller.showRegister);
router.post('/register', auth_controller.register);

router.get('/logout', auth_controller.logout);

module.exports = router;
