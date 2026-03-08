const User = require('../../models/admin/user.model.js');
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
        return res.status(400).render('authentification/admin/login', {
            error: 'Champs manquants'
        });
    }

    try {
        const user = await User.db_find_user_by_username(username);

        if (!user) {
            return res.status(401).render('authentification/admin/login', {
                error: 'Nom d\'utilisateur ou mot de passe invalide'

            });
        }

        const userPassWord = await User.verifyPassword(password, user.password);

        if (!userPassWord) {
            return res.status(401).render('authentification/admin/login', {
                error: 'user name  or password invalide '
            });
        }
        //add search role and then redirect

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        if (user.role === 'admin') return res.redirect('/admin');
        if (user.role === 'teacher') return res.redirect('/teacher');
        return res.redirect('/student');

    } catch (err) {
        console.log(err);
        return res.status(500).render('authentification/admin/login', {
            error: 'Erreur serveur'
        });
    }
}

async function logout(req, res) {
    const user = req.session && req.session.user;
    const role = req.session.user.role;
    req.session.destroyit (err => {
        if (err) {
            console.error('Erreur lors de la destruction de la session', err);
            return res.status(500).redirect('/');
        }

        if ( user && role === 'admin') return res.redirect('/login/admin');
        if ( user && role === 'teacher') return res.redirect('/login/teacher');
        return res.redirect('/login/student');
    });
}
async function showRegister(req, res) {
    const user = req.session && req.session.user;
    const role = user && user.role;
    const userCount = await User.db_count_users();
    if (userCount > 0) {
        return res.status(403).redirect('/register');
    }
    if (user && role === 'admin') return res.redirect('/register/admin');
    if (user && role === 'teacher') return res.redirect('/register/teacher');
    return res.redirect('/register/student');t 
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
        return res.status(400).render('authentification/admin/register', {
            error: 'filed or passwords do not match'
        });
    }

    try {
        const user = await User.db_find_user_by_username(username);
        if (user) {
            return res.status(400).render('authentification/admin/register', {
                error: 'Username already exists'
            });
        }

        await User.db_insert_user(username, email, password, 'admin');
        return res.redirect('/login');

    } catch (err) {
        console.log(err);
        return res.status(500).render('authentification/admin/register', {
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
