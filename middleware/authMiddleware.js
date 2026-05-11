const authMiddleware = {

  // Blocks access to any route if the user is not logged in
  isLoggedIn: (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    next(); // User is logged in — continue to the route handler
  },

  // Redirects logged-in users away from login/signup pages
  isGuest: (req, res, next) => {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    next(); // User is NOT logged in — continue to the route handler
  }

};

module.exports = authMiddleware;