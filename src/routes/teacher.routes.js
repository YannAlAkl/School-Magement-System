const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
router.get('/teacher', requireRole('teacher'), (req, res) => { 
    res.send('Tableau de bord enseignant (placeholder)');
});
module.exports = router;
