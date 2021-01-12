const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// User model

const User = require('../models/User')

//Login page
router.get ('/login', (req, res) => res.render('login'));

//Register page
router.get ('/Register', (req, res) => res.render('register'));

//Register Handle

router.post('/register', (req,res) => {
    const {name, email, password, password2 } = req.body;
    let errors = [];


    // check required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg : 'please fill in all fields'});
    }

    // check passwords match
    if(password !== password2) {
        errors.push({msg : 'Passwords do not match'});
    }
    
    // check pass length
    if(password.length > 20) {
        errors.push({msg : 'Password should be at least 6 characters'});

    }
    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //validation passed
        User.findOne({email : email})
        .then(user => {
            if(user) {
                // User exists
                errors.push({msg : 'Email is already registerd'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,     // es6 format
                    email,
                    password
                });

                // Hash Password
                bcrypt.genSalt(10, (err, salt) => 
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    // Set password to hashed
                    newUser.password = hash;
                    // Save user
                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'you are now registered and can login'); // this takes care of creating the flash message, but we have to display it
                            res.redirect('/users/login'); // we want to call that flash message before we redirect
                        })
                        .catch(err => console.log(err)); 
                    
                 }))

                console.log(newUser)
               
            }
        });
    }
});

 // login Handle
 router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',  // this didnt work at first because we didnt create a router for it yet so it would show *Cannot Get /dashboard*
        failureRedirect: '/users/login',
        failureFlash : true
    })(req, res, next);
 });

// Logout Handle
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'you are logged out');
    res.redirect('/users/login'); 
})
module.exports = router;