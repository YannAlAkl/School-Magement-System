const express = require('express');
const router = express.Router();

const {
    db_find_user_by_username,
    db_find_user_by_email,

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
});
try {
    const userExists = await db_find_user_by_username(username);
    const  emailExists = await db_find_user_by_email(email);

    if (userExists || emailExists) {
        req.session.msgErreur = 'Ce nom d\'utilisateur existe déjà';
        return res.redirect('/teacher/register');   
    }

    const nbUsers = await db_count_users();
    const role = (nbUsers === 0) ? 'admin' : 'teacher'|| 'student';
    user_id = db_insert_user(username, email, password, role);
    req.session.msgSuccès = 'Compte créé avec succès';
    return res.redirect('/teacher/login');
}   catch (error) {
    req.session.msgErreur = error.message;
    return res.redirect('/teacher/register');
}








