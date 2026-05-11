const pool = require('../config/db');

const jobModel = {

  // Get all jobs for a user (with optional status filter and search)
  findAllByUser: async (userId, { status, search } = {}) => {
    let query  = `SELECT * FROM jobs WHERE user_id = $1`;
    const params = [userId];
    let   idx    = 2; // Next parameter index

    if (status && status !== 'All') {
      query += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }

    if (search) {
      // ILIKE = case-insensitive LIKE in PostgreSQL
      query += ` AND (company_name ILIKE $${idx} OR role ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get a single job by ID — also checks user_id for security
  findById: async (id, userId) => {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0];
  },

  // Create a new job application
  create: async (userId, data) => {
    const {
      company_name, role, status,
      applied_date, interview_date, notes, link
    } = data;

    const result = await pool.query(
      `INSERT INTO jobs
        (user_id, company_name, role, status, applied_date, interview_date, notes, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        userId,
        company_name,
        role,
        status       || 'Applied',
        applied_date  || null,
        interview_date || null,
        notes         || null,
        link          || null
      ]
    );
    return result.rows[0];
  },

  // Update an existing job
  update: async (id, userId, data) => {
    const {
      company_name, role, status,
      applied_date, interview_date, notes, link
    } = data;

    const result = await pool.query(
      `UPDATE jobs
       SET company_name   = $1,
           role           = $2,
           status         = $3,
           applied_date   = $4,
           interview_date = $5,
           notes          = $6,
           link           = $7,
           updated_at     = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        company_name,
        role,
        status,
        applied_date   || null,
        interview_date || null,
        notes          || null,
        link           || null,
        id,
        userId
      ]
    );
    return result.rows[0];
  },

  // Delete a job
  delete: async (id, userId) => {
    await pool.query(
      `DELETE FROM jobs WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  // Get counts grouped by status — for the dashboard
  getStatusCounts: async (userId) => {
    const result = await pool.query(
      `SELECT
         COUNT(*)                                          AS total,
         COUNT(*) FILTER (WHERE status = 'Applied')       AS applied,
         COUNT(*) FILTER (WHERE status = 'Interviewing')  AS interviewing,
         COUNT(*) FILTER (WHERE status = 'Offer')         AS offer,
         COUNT(*) FILTER (WHERE status = 'Rejected')      AS rejected
       FROM jobs
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  // Get 5 most recent jobs — for the dashboard
  getRecent: async (userId) => {
    const result = await pool.query(
      `SELECT * FROM jobs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );
    return result.rows;
  }

};

module.exports = jobModel;