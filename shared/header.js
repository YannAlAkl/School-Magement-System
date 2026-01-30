const headView = () =>`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title> <!-- Titre d'espace réservé, idéalement celui-ci serait dynamique. -->
</head>
<body>
    <div class="topbar">
    <div class="topbar-inner">
    <div class="brand">School Management System</div>
    <div class="navlinks">
      <a href="/admin">Dashboard</a>
      <a href="/admin/courses/">Courses</a>
      <a href="/admin/users/add">Add User</a>
      <a href="/logout">Logout</a>
    </div>
  </div>
</div>
</body>
</html>
`;
