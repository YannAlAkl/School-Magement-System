const User = require('../models/user.model');
const Course = require('../models/course.model');

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
    return res.render('admin/users_add', {
        user: req.session.user,
        error: null,
        success: null,
    });
}

async function addUser(req, res) {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).render('admin/users_add', {
            user: req.session.user,
            error: 'Tous les champs sont requis.',
            success: null,
        });
    }

    try {
        const userExists = await User.db_find_user_by_username(username);
        const emailExists = await User.db_find_user_by_email(email);

        if (userExists || emailExists) {
            return res.status(400).render('admin/users_add', {
                user: req.session.user,
                error: "Nom d'utilisateur ou e-mail déjà utilisé.",
                success: null,
            });
        }

        await User.db_insert_user(username, email, password, role);

        return res.render('admin/dashboard', {
            user: req.session.user,
            error: null,
            success: 'Utilisateur ajouté avec succès.',
        });
        
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", err);
        return res.status(500).render('admin/users_add', {
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
            return res.render('admin/edit_role');
        }

        return res.render('admin/edit_role', {
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
        return res.render('/admin/edit_role');
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

async function showCourses(req, res) {
    try {
        const courses = await Course.db_view_courses();

        return res.render('admin/courses', {
            user: req.session.user,
            courses: courses,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Erreur lors de l'affichage des cours:", err);
        return res.status(500).render('admin/courses', {
            user: req.session.user,
            courses: [],
            error: 'Erreur serveur lors du chargement des cours.',
            success: null,
        });
    }
}

async function addCourse(req, res) {
    const { title, description, coeficient, course_hours } = req.body;

    if (!title || !description || !coeficient || !course_hours) {
        return res.status(400).render('admin/courses_add', {
            user: req.session.user,
            error: 'Tous les champs sont requis.',
            success: null,
        });
    }
    try {
        const courseExists = await Course.db_find_course_by_title(title);

        if (courseExists) {
            return res.status(400).render('admin/courses_add', {
                user: req.session.user,
                error: "Le cours existe déjà.",
                success: null,
            });
        }

        await Course.db_insert_course(title, description, coeficient, course_hours);

        return res.render('admin/courses', {
            user: req.session.user,
            error: null,
            success: 'Cours ajouté avec succès.',
        });
        
    }
    catch (err) {
        console.error("Erreur lors de l'ajout du cours:", err);
        return res.status(500).render('admin/courses_add', {
            user: req.session.user,
            error: "Erreur serveur lors de l'ajout du cours.",
            success: null,
        });
    }
}

async function deleteCourse(req, res) {
    const courseId = req.params.id;

    try {
        const success = await Course.db_delete_course(courseId);
        if (success) {
            req.session.success = 'Cours supprimé avec succès.';
        } else {
            req.session.error = "Échec de la suppression du cours.";
        }
    } catch (err) {
        console.error("Erreur lors de la suppression du cours:", err);
        req.session.error = "Erreur serveur lors de la suppression du cours.";
    }

    return res.redirect('/admin');
}

async function showEditCourseForm(req, res) {
    const courseId = req.params.id;

    try {
        const courseToEdit = await Course.db_find_course_by_id(courseId);

        if (!courseToEdit) {
            req.session.error = 'Cours non trouvé.';
            return res.render('admin/edit_course');
        }

        return res.render('admin/edit_course', {
            user: req.session.user,
            courseToEdit: courseToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Erreur lors de l'affichage du formulaire de modification du cours:", err);
        req.session.error = 'Erreur serveur.';
        return res.redirect('/admin');
    }
}

async function editCourse(req, res) {
    const courseId = req.params.id;
    const { title, description, coeficient, course_hours } = req.body;

    if (!title || !description || !coeficient || !course_hours) {
        req.session.error = 'Tous les champs sont requis.';
        return res.render('/admin/edit_course');
    }

    try {
        const success = await Course.db_edit_course(courseId, title, description, coeficient, course_hours);
        if (success) {
            req.session.success = "Cours mis à jour avec succès.";
        } else {
            req.session.error = "Échec de la mise à jour du cours.";
        }
    } catch (err) {
        console.error("Erreur lors de la modification du cours:", err);
        req.session.error = 'Erreur serveur lors de la mise à jour du cours.';
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
     showCourses, 
     addCourse, 
     deleteCourse, 
     showEditCourseForm, 
     editCourse,

};
