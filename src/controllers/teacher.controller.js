
const express = require('express');

const router = express.Router();


const {
    db_find_user_by_username,
    db_find_user_by_email,
    db_count_users,   
    db_insert_user,   
} = require('../models/user.model');


router.get('/register', (req, res) => {
    
    res.render('teacher/register',{
        title:"S'enregistrer", 
        user : req.session.user || null, 
        msgErreur : req.session.msgErreur ,   
    });
});


router.post('/register', async (req, res) => {
    
    const email = req.body.email?.trim() || '';
    const username = req.body.username?.trim() || '';
    const password = req.body.password?.trim() || '';

    
    if (!email || !username || !password) {
        req.session.msgErreur = 'Veuillez remplir tous les champs'; 
        return res.redirect('/teacher/register'); 
    }

    try {
        
        const userExists = await db_find_user_by_username(username);
        const emailExists = await db_find_user_by_email(email);

        if (userExists || emailExists) {
            req.session.msgErreur = 'Ce nom d\'utilisateur ou email existe déjà'; 
            return res.redirect('/teacher/register');   
        }

        
        
        const nbUsers = await db_count_users();
        const role = (nbUsers === 0) ? 'admin' : 'teacher'; 

        
        const user_id = await db_insert_user(username, email, password, role); 
        
        req.session.msgSuccès = 'Compte créé avec succès'; 
        return res.redirect('/login'); 

    } catch (error) {
        
        console.error('Erreur lors de l/inscription de l/nseignant:', error);
        req.session.msgErreur = error.message; 
        return res.redirect('/teacher/register'); 
    }
});



module.exports = router;
