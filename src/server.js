const express = require('express');
const app = express();
const port = 3000;

const authRoutes = require("./routes/auth.routes");
app.use(authRoutes);
const teacherRoutes = require("./routes/teacher.routes");
app.use(teacherRoutes);
const adminRoutes = require("./routes/admin.routes");
app.use(adminRoutes);
const studentRoutes = require("./routes/student.routes");
app.use(studentRoutes);

app.listen(port, () => { console.log(`Server is running on port ${port}`); });




