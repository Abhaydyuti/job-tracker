const pool = require('../config/db');

const userModel = {

  // Find a user by their email address
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0]; // Returns user object or undefined
  },

  // Find a user by their ID (used to load session user)
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Insert a new user into the database
  create: async (name, email, hashedPassword) => {
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );
    return result.rows[0]; // Returns the newly created user
  }

};

module.exports = userModel;