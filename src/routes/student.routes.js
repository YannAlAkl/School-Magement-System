const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
router.get('/student', requireRole('student'), (req, res) => {
    
    res.send('Tableau de bord étudiant (placeholder)');
});
module.exports = router;
