const bcrypt    = require('bcrypt');
const userModel = require('../models/userModel');
const { validationResult } = require('express-validator');

const SALT_ROUNDS = 10; // bcrypt work factor — higher = slower = more secure

const authController = {

  // GET /signup — Show the signup form
  getSignup: (req, res) => {
    res.render('auth/signup', {
      title:  'Create Account',
      errors: [],
      old:    {}
    });
  },

  // POST /signup — Handle signup form submission
  postSignup: async (req, res) => {
    const errors = validationResult(req);

    // If validation failed, re-render the form with error messages
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/signup', {
        title:  'Create Account',
        errors: errors.array(),
        old:    req.body  // Preserve what the user typed
      });
    }

    try {
      const { name, email, password } = req.body;

      // Check if email is already registered
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).render('auth/signup', {
          title:  'Create Account',
          errors: [{ msg: 'An account with that email already exists.' }],
          old:    req.body
        });
      }

      // Hash the password — NEVER store plain text passwords
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Save new user to the database
      const newUser = await userModel.create(name, email, hashedPassword);

      // Log the user in immediately by saving their ID to the session
      req.session.userId   = newUser.id;
      req.session.userName = newUser.name;

      res.redirect('/dashboard');

    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).render('error', {
        message: 'Something went wrong during signup.',
        error: err
      });
    }
  },

  // GET /login — Show the login form
  getLogin: (req, res) => {
    res.render('auth/login', {
      title:  'Sign In',
      errors: [],
      old:    {}
    });
  },

  // POST /login — Handle login form submission
  postLogin: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('auth/login', {
        title:  'Sign In',
        errors: errors.array(),
        old:    req.body
      });
    }

    try {
      const { email, password } = req.body;

      // Look up the user by email
      const user = await userModel.findByEmail(email);

      // Use a vague error — don't tell attackers which field is wrong
      const invalidMsg = 'Invalid email or password.';

      if (!user) {
        return res.status(401).render('auth/login', {
          title:  'Sign In',
          errors: [{ msg: invalidMsg }],
          old:    req.body
        });
      }

      // Compare submitted password against stored hash
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).render('auth/login', {
          title:  'Sign In',
          errors: [{ msg: invalidMsg }],
          old:    req.body
        });
      }

      // Credentials are valid — save user info to session
      req.session.userId   = user.id;
      req.session.userName = user.name;

      res.redirect('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).render('error', {
        message: 'Something went wrong during login.',
        error: err
      });
    }
  },

  // POST /logout — Destroy the session
  postLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect('/dashboard');
      }
      res.clearCookie('connect.sid'); // Remove the session cookie from browser
      res.redirect('/login');
    });
  }

};

module.exports = authController;