const User = require('../models/user.model');
const Course = require('../models/course.model');
const Event = require('../models/calendar.model');

// ===== Calendar helpers =====
function pad2(n) {
    return String(n).padStart(2, '0');
}

function toYMD(value) {
    // MySQL DATE can be Date or string
    if (!value) return '';
    const d = (value instanceof Date) ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toHM(value) {
    // TIME usually "HH:MM:SS" or "HH:MM"
    if (!value) return '';
    const s = String(value);
    return s.length >= 5 ? s.slice(0, 5) : s;
}

function monthLabelFrom(year, monthIndex0) {
    const labels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${labels[monthIndex0]} ${year}`;
}

function buildCalendarWeeks(year, monthIndex0, eventsByYMD) {
    // Monday-first calendar
    const first = new Date(year, monthIndex0, 1);
    const last = new Date(year, monthIndex0 + 1, 0);

    // Convert JS Sunday=0..Saturday=6 -> Monday=0..Sunday=6
    const firstDay = (first.getDay() + 6) % 7;

    const weeks = [];
    let cursor = new Date(year, monthIndex0, 1 - firstDay);

    for (let w = 0; w < 6; w++) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const ymd = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`;
            const otherMonth = cursor.getMonth() !== monthIndex0;
            const count = eventsByYMD.get(ymd) || 0;

            week.push({
                day: cursor.getDate(),
                otherMonth,
                hasEvents: count > 0,
                count
            });

            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);

        // Optional early stop after month end if the next row starts a new week
        if (cursor > last && ((cursor.getDay() + 6) % 7) === 0) break;
    }

    return weeks;
}


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
        console.error("Error showing admin dashboard:", err);
        return res.status(500).render('admin/dashboard', {
            user: req.session.user,
            users: [],
            error: 'Server error while loading users.',
            success: null,
        });
    }
}

async function showAddUser(req, res) {
    return res.render('admin/users_add', {
        user: req.session.user,
        error: null,
        success: null,
    });
}

async function addUser(req, res) {
    const {
        username,
        email,
        password,
        role
    } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).render('admin/users_add', {
            user: req.session.user,
            error: 'All fields are required.',
            success: null,
        });
    }

    try {
        const userExists = await User.db_find_user_by_username(username);
        const emailExists = await User.db_find_user_by_email(email);

        if (userExists || emailExists) {
            return res.status(400).render('admin/users_add', {
                user: req.session.user,
                error: "Username or email already used.",
                success: null,
            });
        }

        await User.db_insert_user(username, email, password, role);

        return res.render('admin/dashboard', {
            user: req.session.user,
            error: null,
            success: 'User added with success.',
        });

    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", err);
        return res.status(500).render('admin/users_add', {
            user: req.session.user,
            error: "Server error while adding user.",
            success: null,
        });
    }
}

async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        const success = await User.db_delete_user(userId);
        if (success) {
            req.session.success = 'User deleted with success.';
        } else {
            req.session.error = "   Error deleting user.";
        }
    } catch (err) {
        console.error("Error deleting user:", err);
        req.session.error = "   Server error while deleting user.";
    }

    return res.redirect('/admin/dashboard');
}

async function showEditUserRole(req, res) {
    const userId = req.params.id;

    try {
        const userToEdit = await User.db_find_user_by_id(userId);

        if (!userToEdit) {
            req.session.error = '   User not found.';
            return res.render('admin/edit_role');
        }

        return res.render('admin/edit_role', {
            user: req.session.user,
            userToEdit: userToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing edit user role form:", err);
        req.session.error = 'Server error.';
        return res.redirect('/admin/dashboard');
    }
}

async function editUserRole(req, res) {
    const userId = req.params.id;
    const {
        newRole
    } = req.body;

    if (!newRole) {
        req.session.error = 'New role is required.';
        return res.render('/admin/edit_role');
    }

    try {
        const success = await User.db_update_user_role(userId, newRole);
        if (success) {
            req.session.success = "User role updated with success.";
        } else {
            req.session.error = "Error updating user role.";
        }
    } catch (err) {
        console.error("Error editing user role:", err);
        req.session.error = 'Server error while updating user role.';
    }

    return res.redirect('/admin/dashboard');
}

async function addCourse(req, res) {
    const {
        title,
        description,
        coeficient,
        course_hours
    } = req.body;
    try {
        // 1. Check if course exists
        const courseExists = await Course.db_find_course_by_title(title);

        // IMPORTANT: We need the list of courses for EVERY render of this page
        const courses = await Course.db_find_all_courses();

        if (courseExists) {
            return res.status(400).render('admin/courses', {
                user: req.session.user,
                courses: courses, // Added this
                error: "Course already exists.",
                success: null,
            });
        }

        // 2. Insert the course
        await Course.db_insert_course(title, description, coeficient, course_hours);

        // 3. Refresh the list after insertion
        const updatedCourses = await Course.db_find_all_courses();

        return res.render('admin/courses', {
            user: req.session.user,
            courses: updatedCourses, // Added this
            error: null,
            success: 'Course added with success.',
        });

    } catch (err) {
        console.error("Erreur lors de l'ajout du cours:", err);
        // Even on error, the view needs the courses array (even if empty)
        return res.status(500).render('admin/courses', {
            user: req.session.user,
            courses: [], // Added this to prevent EJS crash
            error: "Server error while adding course.",
            success: null,
        });
    }
}
async function editCourse(req, res) {
    const courseId = req.params.id;
    const {
        title,
        description,
        coeficient,
        course_hours
    } = req.body;
    try {
        const success = await Course.db_edit_course(courseId, title, description, coeficient, course_hours);
        if (success) {
            req.session.success = "Course updated with success.";
        } else {
            req.session.error = "Error updating course.";
        }
    } catch (err) {
        console.error("Error editing course:", err);
        req.session.error = 'Server error while updating course.';
    }
    return res.redirect('/admin/courses');

}
async function showEditCourse(req, res) {
    const courseId = req.params.id;
    try {
        const courseToEdit = await Course.db_find_course_by_id(courseId);
        if (!courseToEdit) {
            req.session.error = 'Cours non trouvé.';
            return res.render('admin/courses');
        }
        return res.render('admin/courses', {
            user: req.session.user,
            courseToEdit: courseToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing edit course form:", err);
        req.session.error = 'Server error .';
        return res.redirect('/admin/courses');
    }
}
async function deleteCourse(req, res) {
    const courseId = req.params.id;
    try {
        const success = await Course.db_delete_course(courseId);
        if (success) {
            req.session.success = 'Course deleted with success.';
        } else {
            req.session.error = "Error deleting course.";
        }
    } catch (err) {
        console.error("Error deleting course:", err);
        req.session.error = "Server error while deleting course.";
    }
    return res.redirect('/admin/courses');
}

async function showCourses(req, res) {
    try {
        const courses = await Course.db_find_all_courses();
        return res.render('admin/courses', {
            user: req.session.user,
            courses: courses,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing courses:", err);
        return res.status(500).render('admin/courses', {
            user: req.session.user,
            courses: [],
            error: 'Server error while loading courses.',
            success: null,
        });
    }
}

async function assignCourseToUser(req, res) {
    const courseId = req.body.course_id;
    const userId = req.body.user_id;
    try {
        const success = await Course.attributeCourseToUser(courseId, userId);
        if (success) {
            req.session.success = 'Course assigned with success.';
        } else {
            req.session.error = "Error assigning course.";
        }
    } catch (err) {
        console.error("Error assigning course:", err);
        req.session.error = 'Error assigning course.';
    }
    return res.redirect('/admin/courses');
}
async function showAssignCourseToUser(req, res) {
    const courseId = req.params.id;
    try {
        const courseToEdit = await Course.db_showAssignCourseToUser(courseId);
        if (!courseToEdit) {
            req.session.error = 'Course not found.';
            return res.render('admin/courses');
        }
        return res.render('admin/courses', {
            user: req.session.user,
            courseToEdit: courseToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing edit course form:", err);
        req.session.error = 'Server error.';
        return res.redirect('/admin /courses'); 
    }
}

async function addEnrolement(req, res) {
    const {
        student_username,
        student_id,
        course_title,
        enroll_status,
        enroll_date
    } = req.body;
    try {
        const success = await Course.db_addEnrolement( student_id, student_username, course_title, enroll_status, enroll_date);
        if (success) {
            req.session.success = 'Course assigned with success.';
        } else {
            req.session.error = "Error assigning course.";
        }
    }
    catch (err) {
        console.error("Error assigning course:", err);  
        req.session.error = 'server error while assigning course.';
    }
    return res.redirect('/admin/enrolement/payement');
}
async function editEnrolement(req, res) {
    const enrolment_id = req.params.id;
    const {
        student_id,
        student_username,
        course_title,
        enroll_status,
        enroll_date
    } = req.body;
    try {
        const success = await Course.db_editEnrolement(enrolment_id, student_id, student_username, course_title, enroll_status, enroll_date);
        if (success) {
            req.session.success = 'Enrolement updated with success.';
        } else {
            req.session.error = "Erreur lors de la mise à jour de l'enrolment.";
        }
    }
    catch (err) {
        console.error("Error editing enrolment:", err);
        req.session.error = 'Server error while updating enrolment.';        
    }    
    return res.redirect('/admin/enrolement/payement');
}

async function deleteEnrolement(req, res) {
    const enrolment_id = req.params.id;
    try {
        const success = await Course.db_deleteEnrolement(enrolment_id);
        if (success) {
            req.session.success = 'Enrolement supprimé avec succès.';
            return res.redirect('/admin/enrolement');
        } else {
            req.session.error = "Erreur lors de la suppression de l'enrolment.";
            return res.redirect('/admin/enrolement');

        }
    }
    catch (err) {
        console.error("Error deleting enrolment:", err);
        req.session.error = 'Server error while deleting enrolment.';
        return res.redirect('/admin/enrolement');
    }
}
    

async function addPayment(req, res) {
    const {
        student_username,
        course_title,
        amount,
        currency,
        method,
        payment_date,
        status,
        reference,
        note
        } = req.body;
    try {
        const success = await Course.db_addPayment(student_username, course_title, amount, currency, method, payment_date, status, reference, note);
        if (success) {
            req.session.success = 'Paiement enregistré avec succès.';
        } else {
            req.session.error = "Erreur lors de l'enregistrement du paiement.";
        }
    }
    catch (err) {
        console.error("Error adding payment:", err);
        req.session.error = "Erreur serveur lors de l'enregistrement du paiement.";
    }
    return res.redirect('/admin/enrolement/payement');
}

async function editPayment(req, res) {
    const payment_id = req.params.id;
    const {
        student_username,
        course_title,
        amount,
        currency,
        method,
        payment_date,
        status,
        reference,
        note
        } = req.body;
    try {
        const success = await Course.db_editPayment(payment_id, student_username, course_title, amount, currency, method, payment_date, status, reference, note);
        if (success) {
            req.session.success = 'Paiement mis à jour avec succès.';
        } else {
            req.session.error = "Erreur lors de la mise à jour du paiement.";
        }
    }
    catch (err) {
        console.error("Error editing payment:", err);
        req.session.error = 'Server error while updating payment.';
    }
    return res.redirect('/admin/enrolement/payement');
}
async function deletePayment(req, res) {
    const payment_id = req.params.id;
    try {
        const success = await Course.db_deletePayment(payment_id);
        if (success) {
            req.session.success = 'Paiement supprimé avec succès.';
        } else {
            req.session.error = "Erreur lors de la suppression du paiement.";
        }
    }
    catch (err) {
        console.error("Error deleting payment:", err);
        req.session.error = 'Server error while deleting payment.';
    }
    return res.redirect('/admin/enrolement/payement');   
}   
async function showEnrolementPayement(req, res) {
    try {
        // Récupérer les utilisateurs étudiants et les cours disponibles pour l'enrôlement
        const User = require('../models/user.model');
        const Course = require('../models/course.model');

        const students = await User.db_find_users_by_role('student');
        const courses = await Course.db_find_all_courses();
        const enrollments = await Enrolement.db_showAllEnrolements();

        return res.render('admin/enrolement_payement', {
            user: req.session.user,
            students: students,
            courses: courses,
            enrollments: enrollments,
            error: null,
            success: null
        });
    } catch (err) {
        console.error('Error displaying enrollment payment:', err);
        return res.status(500).render('admin/enrolement_payement', {
            user: req.session.user,
            students: [],
            courses: [],
            enrollments: [],
            error: 'Server error while loading data.',
            success: null
        });
    }
}

// ===== Calendar controllers =====

async function showcalendar(req, res) {
  try {
    // month query param format: YYYY-MM
    const monthParam = req.query.month;
    const now = new Date();

    const year = monthParam ? Number(monthParam.slice(0, 4)) : now.getFullYear();
    const monthIndex0 = monthParam ? (Number(monthParam.slice(5, 7)) - 1) : now.getMonth();

    const monthStart = `${year}-${pad2(monthIndex0 + 1)}-01`;
    const monthEndDate = new Date(year, monthIndex0 + 1, 1);
    const monthEnd = `${monthEndDate.getFullYear()}-${pad2(monthEndDate.getMonth() + 1)}-${pad2(monthEndDate.getDate())}`;

    // IMPORTANT: This requires Event.db_find_events_by_month(start, end)
    // If you don't have it yet, add it to calendar.model.js (I give you the function below).
    const events = await Event.db_find_events_by_month(monthStart, monthEnd);

    const eventsFormatted = events.map(e => ({
      ...e,
      date_ymd: toYMD(e.date),
      time_hm: toHM(e.time),
    }));

    const eventsByYMD = new Map();
    for (const e of eventsFormatted) {
      if (!e.date_ymd) continue;
      eventsByYMD.set(e.date_ymd, (eventsByYMD.get(e.date_ymd) || 0) + 1);
    }

    const calendarWeeks = buildCalendarWeeks(year, monthIndex0, eventsByYMD);

    const error = req.session.error || null;
    const success = req.session.success || null;
    req.session.error = null;
    req.session.success = null;

    return res.render('admin/calendar', {
      user: req.session.user,
      events: eventsFormatted,
      eventToEdit: null,
      error,
      success,
      selectedMonth: `${year}-${pad2(monthIndex0 + 1)}`,
      monthLabel: monthLabelFrom(year, monthIndex0),
      calendarWeeks,
    });
  } catch (err) {
    console.error("Error displaying calendar:", err);
    return res.status(500).render('admin/calendar', {
      user: req.session.user,
      events: [],
      eventToEdit: null,
      error: 'Server error while loading events.',
      success: null,
      selectedMonth: '',
      monthLabel: 'Calendrier',
      calendarWeeks: [],
    });
  }
}

async function showEditEvent(req, res) {
  try {
    const eventId = req.params.id;
    const event = await Event.db_find_event_by_id(eventId);

    if (!event) {
      req.session.error = "Event not found.";
      return res.redirect('/admin/calendar');
    }

    const eventYMD = toYMD(event.date);
    const year = Number(eventYMD.slice(0, 4));
    const monthIndex0 = Number(eventYMD.slice(5, 7)) - 1;

    const monthStart = `${year}-${pad2(monthIndex0 + 1)}-01`;
    const monthEndDate = new Date(year, monthIndex0 + 1, 1);
    const monthEnd = `${monthEndDate.getFullYear()}-${pad2(monthEndDate.getMonth() + 1)}-${pad2(monthEndDate.getDate())}`;

    const events = await Event.db_find_events_by_month(monthStart, monthEnd);

    const eventsFormatted = events.map(e => ({
      ...e,
      date_ymd: toYMD(e.date),
      time_hm: toHM(e.time),
    }));

    const eventsByYMD = new Map();
    for (const e of eventsFormatted) {
      if (!e.date_ymd) continue;
      eventsByYMD.set(e.date_ymd, (eventsByYMD.get(e.date_ymd) || 0) + 1);
    }

    const calendarWeeks = buildCalendarWeeks(year, monthIndex0, eventsByYMD);

    return res.render('admin/calendar', {
      user: req.session.user,
      events: eventsFormatted,
      eventToEdit: {
        ...event,
        date_ymd: toYMD(event.date),
        time_hm: toHM(event.time),
      },
      error: null,
      success: null,
      selectedMonth: `${year}-${pad2(monthIndex0 + 1)}`,
      monthLabel: monthLabelFrom(year, monthIndex0),
      calendarWeeks,
    });
  } catch (err) {
    console.error("Error showEditEvent:", err);
    req.session.error = "Server error.";
    return res.redirect('/admin/calendar');
  }
}

async function addEvent(req, res) {
  const { title, description, date, time, status } = req.body;

  if (!title || !description || !date || !time) {
    req.session.error = "All fields are required.";
    return res.redirect('/admin/calendar');
  }

  try {
    const insertId = await Event.db_insert_event(
      title,
      description,
      date,
      time,
      status || 'planned'
    );

    if (insertId) req.session.success = 'Event added with success.';
    else req.session.error = "Failed to add event.";
  } catch (err) {
    console.error("Error adding event:", err);
    req.session.error = "Server error while adding event.";
  }

  // redirect to same month
  const month = String(date).slice(0, 7);
  return res.redirect(`/admin/calendar?month=${month}`);
}

async function editEvent(req, res) {
  const eventId = req.params.id;
  const { title, description, date, time, status } = req.body;

  if (!title || !description || !date || !time || !status) {
    req.session.error = "All fields are required.";
    return res.redirect('/admin/calendar');
  }

  try {
    const ok = await Event.db_edit_event(eventId, title, description, date, time, status);
    req.session[ok ? 'success' : 'error'] = ok
      ? "Event updated with success."
      : "Failed to update event.";
  } catch (err) {
    console.error("Error updating event:", err);
    req.session.error = "Server error while updating event.";
  }

  const month = String(date).slice(0, 7);
  return res.redirect(`/admin/calendar?month=${month}`);
}

async function deleteEvent(req, res) {
  const eventId = req.params.id;

  try {
    const ok = await Event.db_delete_event(eventId);
    req.session[ok ? 'success' : 'error'] = ok
      ? 'Event deleted with success.'
      : "Failed to delete event.";
  } catch (err) {
    console.error("Error deleting event:", err);
    req.session.error = "Server error while deleting event.";
  }

  return res.redirect('/admin/calendar');
}

module.exports = {
    showDashboard,
    showAddUser,
    addUser,
    deleteUser,
    showEditUserRole,
    editUserRole,
    showCourses,
    addCourse,
    deleteCourse,
    showEditCourse,
    editCourse,
    assignCourseToUser,
    showAssignCourseToUser,
    showEnrolementPayement,
    addEnrolement,
    editEnrolement,
    deleteEnrolement,
    addPayment,
    editPayment,
    deletePayment,
    showcalendar,
    showEditEvent,
    addEvent,
    editEvent,
    deleteEvent,
};