const jobModel = require('../models/jobModel');
const { validationResult } = require('express-validator');

// Status options used across multiple views
const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

const jobController = {

  // GET /dashboard
  getDashboard: async (req, res) => {
    try {
      const [counts, recentJobs] = await Promise.all([
        jobModel.getStatusCounts(req.session.userId),
        jobModel.getRecent(req.session.userId)
      ]);

      res.render('jobs/dashboard', {
        title:     'Dashboard',
        userName:  req.session.userName,
        counts,
        recentJobs
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).render('error', { message: 'Could not load dashboard.', error: err });
    }
  },

  // GET /jobs — List all jobs with optional filter and search
  getJobs: async (req, res) => {
    try {
      const { status, search } = req.query;

      const jobs = await jobModel.findAllByUser(req.session.userId, {
        status: status || 'All',
        search: search || ''
      });

      res.render('jobs/index', {
        title:         'My Applications',
        jobs,
        statusOptions: STATUS_OPTIONS,
        currentStatus: status || 'All',
        currentSearch: search || ''
      });
    } catch (err) {
      console.error('Jobs list error:', err);
      res.status(500).render('error', { message: 'Could not load jobs.', error: err });
    }
  },

  // GET /jobs/new — Show add form
  getNewJob: (req, res) => {
    res.render('jobs/new', {
      title:         'Add Application',
      statusOptions: STATUS_OPTIONS,
      errors:        [],
      old:           {}
    });
  },

  // POST /jobs — Save new job
  postNewJob: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('jobs/new', {
        title:         'Add Application',
        statusOptions: STATUS_OPTIONS,
        errors:        errors.array(),
        old:           req.body
      });
    }

    try {
      await jobModel.create(req.session.userId, req.body);
      res.redirect('/jobs');
    } catch (err) {
      console.error('Create job error:', err);
      res.status(500).render('error', { message: 'Could not save job.', error: err });
    }
  },

  // GET /jobs/:id/edit — Show edit form
  getEditJob: async (req, res) => {
    try {
      const job = await jobModel.findById(req.params.id, req.session.userId);

      if (!job) {
        return res.status(404).render('error', {
          message: 'Job not found or you do not have permission to edit it.',
          error: {}
        });
      }

      res.render('jobs/edit', {
        title:         'Edit Application',
        job,
        statusOptions: STATUS_OPTIONS,
        errors:        [],
        old:           job // Pre-fill form with existing data
      });
    } catch (err) {
      console.error('Edit job error:', err);
      res.status(500).render('error', { message: 'Could not load job.', error: err });
    }
  },

  // PUT /jobs/:id — Update job
  putEditJob: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Re-fetch the job to re-render the form
      const job = await jobModel.findById(req.params.id, req.session.userId);
      return res.status(400).render('jobs/edit', {
        title:         'Edit Application',
        job,
        statusOptions: STATUS_OPTIONS,
        errors:        errors.array(),
        old:           req.body
      });
    }

    try {
      const updated = await jobModel.update(req.params.id, req.session.userId, req.body);

      if (!updated) {
        return res.status(404).render('error', {
          message: 'Job not found.',
          error: {}
        });
      }

      res.redirect('/jobs');
    } catch (err) {
      console.error('Update job error:', err);
      res.status(500).render('error', { message: 'Could not update job.', error: err });
    }
  },

  // DELETE /jobs/:id — Delete job
  deleteJob: async (req, res) => {
    try {
      await jobModel.delete(req.params.id, req.session.userId);
      res.redirect('/jobs');
    } catch (err) {
      console.error('Delete job error:', err);
      res.status(500).render('error', { message: 'Could not delete job.', error: err });
    }
  }

};

module.exports = jobController;