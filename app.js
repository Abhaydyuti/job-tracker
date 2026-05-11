const express        = require('express');
const session        = require('express-session');
const pgSession      = require('connect-pg-simple')(session);
const methodOverride = require('method-override');
const path           = require('path');
const pool           = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const jobRoutes  = require('./routes/jobRoutes');

const app = express();

// Trust proxy headers — required when deploying behind Render/Railway/Heroku
app.set('trust proxy', 1);

// ── View Engine ────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body Parsing ───────────────────────────────────────────
// Lets Express read data sent from HTML forms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Method Override ────────────────────────────────────────
// Allows forms to send PUT and DELETE requests
app.use(methodOverride('_method'));

// ── Sessions ───────────────────────────────────────────────
app.use(session({
  store: new pgSession({
    pool,                       // Use our existing DB pool
    tableName: 'session'        // Auto-created by connect-pg-simple
  }),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
  maxAge:   1000 * 60 * 60 * 24,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax'
}
}));

// ── Global Template Variable ───────────────────────────────
// Makes `currentUser` available in every EJS view automatically
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', jobRoutes);

// ── Root Redirect ──────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: {}
  });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong on our end.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;