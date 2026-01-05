const express = require('express');
const router = express.Router();

const requireRole = require('../middleware/requireRole');

router.get('/admin', requireRole('admin'), (req, res) => {
    res.send('Admin dashboard (placeholder)');
});

module.exports = router;