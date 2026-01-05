const User = require('../models/user.model')

function login(req, res){
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const user = User.db_find_user_by_email(email) && User.db_verified_password(password);
    if (user) {
         return res.redirect('/dashbord');
    }
    else {
        return res.render('/login');
    }
   

    
}

