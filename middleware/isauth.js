
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {  // you're using Passport.js
    res.locals.username = req.user.username;
    return next();  // User is authenticated, proceed to the next middleware/route
  } else {
    // User is not authenticated
    res.redirect('/login');  // Redirect them to the login page
  }
}

module.exports = ensureAuthenticated;
