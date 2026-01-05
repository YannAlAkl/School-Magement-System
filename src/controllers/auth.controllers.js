const User = require('../models/user.model');

async function showLogin(req, res) {
    return res.render('login', {
        error: null
    });
}

async function login(req, res) {
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();

    if (!username || !password) {
        return res.status(400).render('login', {
            error: 'Champs manquants'
        });
    }

    try {
        const user = await User.db_find_user_by_username(username);

        if (!user) {
            return res.status(401).render('login', {
                error: 'Nom d’utilisateur ou mot de passe invalide'
            });
        }

        const ok = await User.verifyPassword(password, user.password);

        if (!ok) {
            return res.status(401).render('login', {
                error: 'Nom d’utilisateur ou mot de passe invalide'
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // ✅ minimal role redirect
        if (user.role === 'admin') return res.redirect('/admin');
        if (user.role === 'teacher') return res.redirect('/teacher');
        return res.redirect('/student');

    } catch (err) {
        console.log(err);
        return res.status(500).render('login', {
            error: 'Erreur serveur'
        });
    }
}

module.exports = {
    showLogin,
    login
};