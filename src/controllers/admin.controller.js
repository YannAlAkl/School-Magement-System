const User = require('../models/user.model');

async function showDashboard(req, res) {
    try {
        const users = await User.db_find_all_users();

        // ✅ read flash messages set by delete/edit-role
        const error = req.session.error || null;
        const success = req.session.success || null;

        // ✅ clear them after reading
        req.session.error = null;
        req.session.success = null;

        return res.render('admin/dashboard', {
            user: req.session.user,
            users: users,
            error: error,
            success: success,
        });
    } catch (err) {
        console.error("Erreur lors de l'affichage du tableau de bord administrateur:", err);
        return res.status(500).render('admin/dashboard', {
            user: req.session.user,
            users: [],
            error: 'Erreur serveur lors du chargement des utilisateurs.',
            success: null,
        });
    }
}

async function showAddUserForm(req, res) {
    return res.render('admin/addUser', {
        user: req.session.user,
        error: null,
        success: null,
    });
}

async function addUser(req, res) {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).render('admin/addUser', {
            user: req.session.user,
            error: 'Tous les champs sont requis.',
            success: null,
        });
    }

    try {
        const userExists = await User.db_find_user_by_username(username);
        const emailExists = await User.db_find_user_by_email(email);

        if (userExists || emailExists) {
            return res.status(400).render('admin/addUser', {
                user: req.session.user,
                error: "Nom d'utilisateur ou e-mail déjà utilisé.",
                success: null,
            });
        }

        await User.db_insert_user(username, email, password, role);

        return res.render('admin/addUser', {
            user: req.session.user,
            error: null,
            success: 'Utilisateur ajouté avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", err);
        return res.status(500).render('admin/addUser', {
            user: req.session.user,
            error: "Erreur serveur lors de l'ajout de l'utilisateur.",
            success: null,
        });
    }
}

async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        const success = await User.db_delete_user(userId);
        if (success) {
            req.session.success = 'Utilisateur supprimé avec succès.';
        } else {
            req.session.error = "Échec de la suppression de l'utilisateur.";
        }
    } catch (err) {
        console.error("Erreur lors de la suppression de l'utilisateur:", err);
        req.session.error = "Erreur serveur lors de la suppression de l'utilisateur.";
    }

    return res.redirect('/admin');
}

async function showEditUserRoleForm(req, res) {
    const userId = req.params.id;

    try {
        const userToEdit = await User.db_find_user_by_id(userId);

        if (!userToEdit) {
            req.session.error = 'Utilisateur non trouvé.';
            return res.redirect('/admin');
        }

        return res.render('admin/editUserRole', {
            user: req.session.user,
            userToEdit: userToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Erreur lors de l'affichage du formulaire de modification de rôle:", err);
        req.session.error = 'Erreur serveur.';
        return res.redirect('/admin');
    }
}

async function editUserRole(req, res) {
    const userId = req.params.id;
    const { newRole } = req.body;

    if (!newRole) {
        req.session.error = 'Le nouveau rôle est requis.';
        return res.redirect('/admin');
    }

    try {
        const success = await User.db_update_user_role(userId, newRole);
        if (success) {
            req.session.success = "Rôle de l'utilisateur mis à jour avec succès.";
        } else {
            req.session.error = "Échec de la mise à jour du rôle de l'utilisateur.";
        }
    } catch (err) {
        console.error("Erreur lors de la modification du rôle:", err);
        req.session.error = 'Erreur serveur lors de la mise à jour du rôle.';
    }

    return res.redirect('/admin');
}

module.exports = {
    showDashboard,
    showAddUserForm,
    addUser,
    deleteUser,
    showEditUserRoleForm,
    editUserRole,
};
