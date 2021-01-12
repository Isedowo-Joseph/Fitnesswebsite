module.exports = {
    ensureAuthenticated : function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();    // return next() will jump out of the callback immediately and the code below return next() in the callback will be unreachable.
        }
     req.flash('error_msg', 'Please log in to view this resouce');
     res.redirect('/users/login');
    }
}