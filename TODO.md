# TODO: Fix Admin Courses Functionality

- [ ] Add db_find_all_courses function to src/models/course.model.js
- [ ] Export attributeCourseToUser from src/models/course.model.js
- [ ] Fix showCourses in src/controllers/admin.controller.js to use db_find_all_courses
- [ ] Add assignCourseToUser function in src/controllers/admin.controller.js
- [ ] Add GET /admin/courses/ route in src/routes/admin.routes.js calling showCourses
- [ ] Add POST /admin/courses/ route in src/routes/admin.routes.js calling assignCourseToUser
- [ ] Rename src/views/admin/cours.ejs to src/views/admin/courses.ejs
