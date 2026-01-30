const User = require('../models/user.model');

async function showLogin(req, res) {
    if (req.session && req.session.user) {
        const role = req.session.user.role;
        if (role === 'admin') return res.redirect('/admin');
        if (role === 'teacher') return res.redirect('/teacher');
        return res.redirect('/student');
    }

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

        const userPassWord = await User.verifyPassword(password, user.password);

        if (!userPassWord) {
            return res.status(401).render('login', {
                error: 'user name invalid'
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        console.log('Connexion réussie - Utilisateur:', { id: user.id, username: user.username, role: user.role });
        console.log('Redirection vers:', user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student');

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

async function logout(req, res) {
    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la destruction de la session', err);
            return res.status(500).redirect('/');
        }
        res.redirect('/login');
    });
}
async function showRegister(req, res) {
    const userCount = await User.db_count_users();
    if (userCount > 0) {
        return res.status(403).redirect('/login');
    }

    return res.render('register', {
        error: null
    });     

}
async function register(req, res) {
    const userCount = await User.db_count_users();
    if (userCount > 0) {
        return res.status(403).redirect('/login');
    }

    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim();
    const password = (req.body.password || '').trim();
    const confirm_password = (req.body.confirm_password || '').trim();

    if (!username || !email || !password || confirm_password !== password) {
        return res.status(400).render('register', {
            error: 'filed or passwords do not match'
        });
    }

    try {
        const user = await User.db_find_user_by_username(username);
        if (user) {
            return res.status(400).render('register', {
                error: 'Username already exists'
            });
        }

        await User.db_insert_user(username, email, password, 'admin');
        return res.redirect('/login');

    } catch (err) {
        console.log(err);
        return res.status(500).render('register', {
            error: 'Server error'
        });
    }
}

module.exports = {
    showLogin,
    login,
    logout,
    showRegister,
    register,
};