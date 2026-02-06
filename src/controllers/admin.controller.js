const User = require('../models/user.model');
const Course = require('../models/course.model');
const Event = require('../models/calendar.model');
const Enrolment = require('../models/enrolment.model');

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

async function showAllUsers(req, res) {
    try {
        const users = await User.db_find_all_users();
        return res.render('admin/users', {
            user: req.session.user,
            users: users,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing all users:", err);
        return res.status(500).render('admin/users', {
            user: req.session.user,
            users: [],
            error: 'Server error while loading users.',
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

async function showUserByUsername(req, res) {
    const username = req.params.username;
    try {
        const user = await User.db_find_user_by_username(username);
        
        if (!user) {
            req.session.error = 'User not found.';
            return res.redirect('/admin/dashboard');
        }
        
        // Store user in session for editing and redirect to dashboard
        req.session.userToEdit = user;
        return res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Error showing user by username:", err);
        req.session.error = 'Server error while loading user.';
        return res.redirect('/admin/dashboard');
    }
}

async function showEditRoleForm(req, res) {
    const username = req.params.username;
    try {
        const userToEdit = await User.db_find_user_by_username(username);
        if (!userToEdit) {
            req.session.error = 'User not found.';
            return res.redirect('/admin/dashboard');
        }
        return res.render('admin/edit_role', {
            user: req.session.user,
            userToEdit: userToEdit,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing edit role form:", err);
        req.session.error = 'Server error while loading user.';
        return res.redirect('/admin/dashboard');
    }
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

        return res.render('admin/users_add', {
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
async function editUserRole(req, res) {
    const userId = req.params.id;
    const {
        newRole
    } = req.body;    
    try {
        const success = await User.db_update_user_role(userId, newRole);
        if (success) {
            req.session.success = "User role updated with success.";
        } else {
            req.session.error = "Error updating user role.";
        }
    }
    catch (err) {
        console.error("Error editing user role:", err);
        req.session.error = 'Server error while updating user role.';
    }    
    return res.redirect('/admin/dashboard');
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
async function addCourse(req, res) {
    const { title, description, coeficient, course_hours, course_price } = req.body;
    console.log("Received course data:", { title, description, coeficient, course_hours, course_price });
    try { 
        await Course.db_insert_course(title, description, coeficient, course_hours, course_price);
        const courses = await Course.db_find_all_courses();
        return res.render('admin/courses', {
            user: req.session.user,
            courses: courses,
            courseToEdit: null,
            error: null,
            success: 'Course added with success.',
        });
    }
    catch (err) {
        console.error("Erreur lors de l'ajout du cours:", err);
        return res.status(500).render('admin/courses', {
            user: req.session.user,
            courses: [],
            courseToEdit: null,
            error: "Server error while adding course.",
            success: null,
        });
    }
}

//fixed the add
async function editCourse(req, res) {
    const courseId = req.params.id; 
    const { title, description, coeficient, course_hours } = req.body; 

    try {
        const success = await Course.db_edit_course(courseId, title, description, coeficient, course_hours); 
        if (success) {
            req.session.success = "Course updated with success.";
        } else {
            req.session.error = "Error updating course.";
        }
    }
    catch (err) {
        console.error("Error editing course:", err);
        req.session.error = 'Server error while updating course.';
    }    
    return res.redirect('/admin/courses'); 
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
async function showCourseByTitle(req, res) {
    const courseTitle = req.params.title;
    try {
        const course = await Course.db_find_course_by_title(courseTitle);
        const courses = await Course.db_find_all_courses();
        return res.render('admin/courses', {
            user: req.session.user,
            courses: courses,
            courseToEdit: course,
            error: null,
            success: null,
        });
    } catch (err) {
        console.error("Error showing course by title:", err);
        return res.status(500).render('admin/courses', {
            user: req.session.user,
            courses: [],
            courseToEdit: null,
            error: 'Server error while loading course.',
            success: null,
        });
    }
}
async function showAllCourses(req, res) {
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
async function addEnrolment(req, res) {
    const { student_username, course_title, enroll_status, enroll_date } = req.body;
    try {
        const success = await Enrolment.db_addEnrolment( student_username, course_title, enroll_status, enroll_date);
        if (success) {
            req.session.success = 'Course assigned with success.';
        } else {
            req.session.error = "Error assigning course.";
        }
    } catch (err) {
        console.error("Error assigning course:", err);  
        req.session.error = 'Server error while assigning course.';
    }
    return res.redirect('/admin/enrolment');
}

async function editEnrolment(req, res) {
    const enrolment_id = req.params.id;
    const {
        student_username,
        course_title,
        enroll_status,
        enroll_date
    } = req.body;
    try {
        const success = await Course.db_editEnrolment(enrolment_id, student_username, course_title, enroll_status, enroll_date);
        if (success) {
            req.session.success = 'Enrolment updated with success.';
        } else {
            req.session.error = "Erreur lors de la mise à jour de l'enrolment.";
        }
    }
    catch (err) {
        console.error("Error editing enrolment:", err);
        req.session.error = 'Server error while updating enrolment.';        
    }    
    return res.redirect('/admin/enrolment');
}

async function deleteEnrolment(req, res) {
    const enrolment_id = req.params.id;
    try {
        const success = await Course.db_deleteEnrolment(enrolment_id);
        if (success) {
            req.session.success = 'Enrolment supprimé avec succès.';
            return res.redirect('/admin/enrolment');
        } else {
            req.session.error = "Erreur lors de la suppression de l'enrolment.";
            return res.redirect('/admin/enrolment');

        }
    }
    catch (err) {
        console.error("Error deleting enrolment:", err);
        req.session.error = 'Server error while deleting enrolment.';
        return res.redirect('/admin/enrolment');
    }
}
async function showEnrolmentByCourse(req, res) {
    const courseTitle = req.params.title;
    const session = req.session || {};
    try {
        const enrolments = await Course.db_findEnrolmentsByCourse(courseTitle);
        return res.render('admin/enrolment', {
            user: session.user || {},
            enrolments: enrolments,
            error: null,
            success: null
        });
    }
    catch (err) {
        console.error("Error showing enrollements by course:", err);
        return res.status(500).render('admin/enrolment', {
            user: {},
            enrolments: [],
            error: 'Server error while loading enrolments.',
            success: null
        });
    }
    
}
async function showEnrolmentByUsername(req, res) {
    const student_username = req.params.username;
    const session = req.session || {};
    try {
        const enrolments = await Course.db_findEnrolmentsByUser(student_username);
        return res.render('admin/enrolment', {
            user: session.user || {},
            enrolments: enrolments,
            error: null,
            success: null
        });
    } catch (err) {
        console.error("Error showing enrollements by username:", err);
        return res.status(500).render('admin/enrolment', {
            user: {},
            enrolments: [],
            error: 'Server error while loading enrolments.',
            success: null
        });
    }
}

async function showPaymentsByUsername(req, res) {
    const student_username = req.params.username;
    const session = req.session || {};
    try {
        const payments = await Course.db_showAllPaymentsByUsername(student_username);
        return res.render('admin/enrolment', {
            user: session.user || {},
            payments: payments,
            error: null,
            success: null
        });
    } catch (err) {
        console.error("Error showing payments by username:", err);
        return res.status(500).render('admin/enrolment', {
            user: {},
            payments: [],
            error: 'Server error while loading payments.',
            success: null
        });
    }
}


async function showPaymentsByCourse(req, res) {
    const courseTitle = req.params.title;
    const session = req.session || {};
    try {
        const payments = await Course.db_showAllPaymentsByCourse(courseTitle);
        return res.render('admin/enrolment', {
            user: session.user || {},
            payments: payments,
            error: null,
            success: null
        });
    }
    catch (err) {
        console.error("Error showing payments by course:", err);
        return res.status(500).render('admin/enrolment', {
            user: {},
            payments: [],
            error: 'Server error while loading payments.',
            success: null
        });
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
            req.session.success = 'Payment recorded with success.';
        } else {
            req.session.error = "Error recording payment.";
        }
    }
    catch (err) {
        console.error("Error adding payment:", err);
        req.session.error = 'Server error while recording payment.';
    }
    return res.redirect('/admin/enrolment');
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
            req.session.success = 'Payment updated with success.';
        } else {
            req.session.error = "Error updating payment.";
        }
    }
    catch (err) {
        console.error("Error editing payment:", err);
        req.session.error = 'Server error while updating payment.';
    }
    return res.redirect('/admin/enrolment');
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
    return res.redirect('/admin/enrolment');
}

async function getStudentTotalAmount(req, res) {
    try {
        const student_username = req.params.username;
        const total = await Course.db_calculateStudentTotalAmount(student_username);
        return res.json({ success: true, total: total || 0 });
    } catch (error) {
        console.error("Erreur calcul montant:", error);
        res.status(500).json({ success: false, error: "Impossible de calculer le montant." });
    }
}



async function showEnrolmentPaiement(req, res) {
    try {
        const data = await Course.db_getEnrollmentPageData();
        const session = req.session;
        return res.render('admin/enrolment', {
            user: session.user,
            students: data.students ,
            courses: data.courses ,
            enrolments: data.enrolments ,
            payments: data.payments ,
            error: session.error ,
            success: session.success,
        });
    } catch (err) {
        console.error("Error showing enrollements and payments:", err);
        return res.status(500).render('admin/enrolment', {
            user: {},
            students: [],
            courses: [],
            enrolments: [],
            payments: [],
            error: 'Erreur serveur',
            success: null
        });
    }
}

async function showcalendar(req, res) {
  try {
    const monthParam = req.query.month;
    const now = new Date();


    const year = monthParam ? Number(monthParam.slice(0, 4)) : now.getFullYear();
    const monthIndex0 = monthParam ? (Number(monthParam.slice(5, 7)) - 1) : now.getMonth();

    // Définir selectedMonth pour l'input type="month"
    const selectedMonth = monthParam || `${year}-${pad2(monthIndex0 + 1)}`;

    const monthStart = `${year}-${pad2(monthIndex0 + 1)}-01`;
    const lastDay = new Date(year, monthIndex0 + 1, 0).getDate(); 
    const monthEnd = `${year}-${pad2(monthIndex0 + 1)}-${pad2(lastDay)}`;

    const events = await Event.db_find_events_by_month(monthStart, monthEnd);

    const eventsFormatted = events.map(e => ({
      ...e,
      date_ymd: toYMD(e.date),
      time_hm: toHM(e.time) 
    }));

    const eventsByYMD = new Map();
    for (const ev of eventsFormatted) {
      const count = eventsByYMD.get(ev.date_ymd) || 0;
      eventsByYMD.set(ev.date_ymd, count + 1);
    }

    const weeks = buildCalendarWeeks(year, monthIndex0, eventsByYMD);
    const label = monthLabelFrom(year, monthIndex0);
    return res.render('admin/calendar', {
      user: req.session.user,
      calendarWeeks: weeks,
      monthLabel: label, 
      selectedMonth: selectedMonth, 
      eventToEdit: null,         
      error:null,
      success: null,
      events: eventsFormatted
    });
  } catch (err) {
    console.error("Error in showcalendar:", err);
    return res.status(500).send("Error loading calendar: " + err.message);
  }
}


async function showEditEvent(req, res) {
  const eventId = req.params.id;
  try {
    const event = await Event.db_find_event_by_id(eventId);
    if (!event) {
      req.session.error = "Event not found.";
      return res.redirect('/admin/calendar');
    }
    return res.render('admin/edit_event', {
      user: req.session.user,
      event: event,
      error: null,
      success: null
    });
  } catch (err) {
    console.error("Error showing edit event:", err);
    req.session.error = 'Server error while loading event.';
    return res.redirect('/admin/calendar');
  }
}

async function addEvent(req, res) {
  const { 
    title, 
    description, 
    date, 
    time, 
    status, 
    created_at = new Date(), 
    updated_at = new Date() 
  } = req.body;

  try {
    await Event.db_insert_event(
      title || null, 
      description || null, 
      date || null, 
      time || null, 
      status || null, 
      created_at, 
      updated_at
    );
    req.session.success = 'Event added successfully.';
  } catch (err) {
    console.error("Error adding event:", err);
    req.session.error = err.code === 'ER_DUP_ENTRY' ? 'Event with this title already exists.' : "Error adding event.";
  }
  return res.redirect('/admin/calendar');
}


async function editEvent(req, res) {
  const eventId = req.params.id;
  const { title, description, date, time } = req.body;
  try {
    const success = await Event.db_update_event(eventId, title, description, date, time);
    if (success) {
      req.session.success = 'Event updated successfully.';
    } else {
      req.session.error = "Failed to update event.";
    }
  } catch (err) {
    console.error("Error editing event:", err);
    req.session.error = err.code === 'ER_DUP_ENTRY' ? 'Event with this title already exists.' : "Failed to update event.";
  }
  return res.redirect('/admin/calendar');
}

async function deleteEvent(req, res) {
  const eventId = req.params.id;
  try {
    const success = await Event.db_delete_event(eventId);
    if (success) {
      req.session.success = 'Event deleted successfully.';
    } else {
      req.session.error = "Failed to delete event.";
    }
  } catch (err) {
    console.error("Error deleting event:", err);
    req.session.error = "Server error while deleting event.";
  }
  return res.redirect('/admin/calendar');
}


module.exports = {
  //dashboard
  showDashboard,
  //users
  showAddUserForm,
  showEditRoleForm,
  addUser,
  deleteUser,
  editUserRole, 
  showAllUsers,
  showUserByUsername,
  //courses
  showAllCourses,
  showCourseByTitle,
  addCourse,
  deleteCourse,
  editCourse,
 //enrollements
 showEnrolmentByUsername,
 showEnrolmentByCourse,
 addEnrolment,
 editEnrolment,
 deleteEnrolment, 
 //payments
 showPaymentsByUsername,
 showPaymentsByCourse,
 addPayment,
 editPayment,
 deletePayment,
 //events
 showcalendar,
 showEditEvent,
 addEvent,
 editEvent,
 deleteEvent,
 //others
 getStudentTotalAmount,
 showEnrolmentPaiement
}