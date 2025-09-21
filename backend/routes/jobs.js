const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Get job statistics for dashboard (IMPORTANT: This route must come BEFORE /:id)
router.get("/stats", async (req, res) => {
  try {
    const query = `
      SELECT 
        j.job_title,
        c.name as company_name,
        COUNT(a.app_id) as total_applications,
        SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) as selected_count
      FROM Job j
      LEFT JOIN Company c ON j.company_id = c.company_id
      LEFT JOIN Application a ON j.job_id = a.job_id
      GROUP BY j.job_id, j.job_title, c.name
      ORDER BY total_applications DESC
      LIMIT 10
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching job stats:", error);
    res.status(500).json({ error: "Failed to fetch job statistics" });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.name as company_name 
      FROM Job j
      LEFT JOIN Company c ON j.company_id = c.company_id
      ORDER BY j.created_at DESC
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.name as company_name 
      FROM Job j
      LEFT JOIN Company c ON j.company_id = c.company_id
      WHERE j.job_id = ?
    `;

    const [results] = await pool.execute(query, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Create new job
router.post("/", async (req, res) => {
  try {
    const {
      company_id,
      job_title,
      job_type,
      location,
      salary,
      description,
      requirements,
    } = req.body;

    if (!company_id || !job_title || !job_type || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO Job (company_id, job_title, job_type, location, salary, description, requirements) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      company_id,
      job_title,
      job_type,
      location,
      salary,
      description,
      requirements,
    ]);

    res.status(201).json({
      message: "Job created successfully",
      job_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// Update job
router.put("/:id", async (req, res) => {
  try {
    const {
      company_id,
      job_title,
      job_type,
      location,
      salary,
      description,
      requirements,
    } = req.body;

    const query = `
      UPDATE Job 
      SET company_id = ?, job_title = ?, job_type = ?, location = ?, salary = ?, description = ?, requirements = ?
      WHERE job_id = ?
    `;

    const [result] = await pool.execute(query, [
      company_id,
      job_title,
      job_type,
      location,
      salary,
      description,
      requirements,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// Delete job
router.delete("/:id", async (req, res) => {
  try {
    const query = "DELETE FROM Job WHERE job_id = ?";
    const [result] = await pool.execute(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Get jobs by company
router.get("/company/:companyId", async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.name as company_name 
      FROM Job j
      LEFT JOIN Company c ON j.company_id = c.company_id
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
    `;

    const [results] = await pool.execute(query, [req.params.companyId]);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching jobs by company:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get jobs with application counts
router.get("/analytics/application-stats", async (req, res) => {
  try {
    const query = `
      SELECT 
        j.job_id,
        j.job_title,
        c.name as company_name,
        COUNT(a.app_id) as total_applications,
        COUNT(CASE WHEN a.status = 'Selected' THEN 1 END) as selected_count,
        COUNT(CASE WHEN a.status = 'Under Review' THEN 1 END) as under_review_count
      FROM Job j
      LEFT JOIN Application a ON j.job_id = a.job_id
      LEFT JOIN Company c ON j.company_id = c.company_id
      GROUP BY j.job_id, j.job_title, c.name
      ORDER BY total_applications DESC
    `;
    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching job analytics:", error);
    res.status(500).json({ error: "Failed to fetch job analytics" });
  }
});

module.exports = router;
