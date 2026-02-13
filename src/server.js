const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.urlencoded({
    extended: true 
}));

app.use(express.json());
app.use(session({
    secret: 'yann-secret', 
    resave: false,         
    saveUninitialized: false 
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, '..', 'public')));
const authRoutes = require("./routes/auth.routes");
app.use(authRoutes);
const teacherRoutes = require("./routes/teacher.routes");
app.use(teacherRoutes);
const adminRoutes = require("./routes/admin.routes");
app.use("/admin", adminRoutes);

const studentRoutes = require("./routes/student.routes");
app.use(studentRoutes); 
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
