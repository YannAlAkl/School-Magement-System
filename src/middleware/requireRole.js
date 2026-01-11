function requireRole(role) {

    return function (req, res, next) {

        console.log('Middleware requireRole - Route:', req.path, 'Rôle requis:', role);
        console.log('Session utilisateur:', req.session?.user ? { id: req.session.user.id, username: req.session.user.username, role: req.session.user.role } : 'Aucune session');

        if (!req.session || !req.session.user) {
            console.log('Pas de session - redirection vers /login');
            return res.redirect('/login');
        }



        if (role && req.session.user.role !== role) {
            console.log('Rôle incorrect - rôle utilisateur:', req.session.user.role, 'rôle requis:', role);
            return res.status(403).send('Accès refusé');
        }

        console.log('Accès autorisé');
        next();
    };
}


module.exports = requireRole;
