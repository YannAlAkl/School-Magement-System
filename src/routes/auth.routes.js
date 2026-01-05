const express = require('express');
const router = express.Router();

const auth_controller = require('../controllers/auth.controllers');

router.get('/login', auth_controller.showLogin);
router.post('/login', auth_controller.login);

module.exports = router;