const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Get placement statistics (IMPORTANT: This route must come BEFORE /:id)
router.get("/placement-stats", async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT s.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) as placed_students,
        ROUND(
          (COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) * 100.0 / 
           NULLIF(COUNT(DISTINCT s.student_id), 0)), 2
        ) as placement_percentage,
        ROUND(AVG(CASE WHEN a.status = 'Selected' THEN j.salary END), 2) as average_salary
      FROM Student s
      LEFT JOIN Application a ON s.student_id = a.student_id
      LEFT JOIN Job j ON a.job_id = j.job_id
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching placement stats:", error);
    res.status(500).json({ error: "Failed to fetch placement statistics" });
  }
});

// Get all applications
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as student_name, j.job_title, c.name as company_name
      FROM Application a
      LEFT JOIN Student s ON a.student_id = s.student_id
      LEFT JOIN Job j ON a.job_id = j.job_id
      LEFT JOIN Company c ON j.company_id = c.company_id
      ORDER BY a.applied_date DESC
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get application by ID
router.get("/:id", async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as student_name, j.job_title, c.name as company_name
      FROM Application a
      LEFT JOIN Student s ON a.student_id = s.student_id
      LEFT JOIN Job j ON a.job_id = j.job_id
      LEFT JOIN Company c ON j.company_id = c.company_id
      WHERE a.app_id = ?
    `;

    const [results] = await pool.execute(query, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Create new application
router.post("/", async (req, res) => {
  try {
    const { student_id, job_id, notes } = req.body;

    if (!student_id || !job_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if application already exists
    const checkQuery =
      "SELECT * FROM Application WHERE student_id = ? AND job_id = ?";
    const [existing] = await pool.execute(checkQuery, [student_id, job_id]);

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Application already exists for this job" });
    }

    const insertQuery = `
      INSERT INTO Application (student_id, job_id, notes, status) 
      VALUES (?, ?, ?, 'Applied')
    `;

    const [result] = await pool.execute(insertQuery, [
      student_id,
      job_id,
      notes,
    ]);

    res.status(201).json({
      message: "Application submitted successfully",
      application_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
});

// Update application status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, interview_date, notes } = req.body;

    const validStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = "UPDATE Application SET status = ?, interview_date = ?, notes = ? WHERE app_id = ?";
    const [result] = await pool.execute(query, [status, interview_date, notes, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

// Get applications by student
router.get("/student/:studentId", async (req, res) => {
  try {
    const query = `
      SELECT a.*, j.job_title, c.name as company_name
      FROM Application a
      LEFT JOIN Job j ON a.job_id = j.job_id
      LEFT JOIN Company c ON j.company_id = c.company_id
      WHERE a.student_id = ?
      ORDER BY a.applied_date DESC
    `;

    const [results] = await pool.execute(query, [req.params.studentId]);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get applications by job
router.get("/job/:jobId", async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as student_name, s.branch, s.cgpa
      FROM Application a
      LEFT JOIN Student s ON a.student_id = s.student_id
      WHERE a.job_id = ?
      ORDER BY a.applied_date DESC
    `;

    const [results] = await pool.execute(query, [req.params.jobId]);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get applications by company
router.get("/company/:companyId", async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as student_name, s.branch, s.cgpa, j.job_title
      FROM Application a
      LEFT JOIN Student s ON a.student_id = s.student_id
      LEFT JOIN Job j ON a.job_id = j.job_id
      WHERE j.company_id = ?
      ORDER BY a.applied_date DESC
    `;

    const [results] = await pool.execute(query, [req.params.companyId]);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Delete application
router.delete("/:id", async (req, res) => {
  try {
    const query = "DELETE FROM Application WHERE app_id = ?";
    const [result] = await pool.execute(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

module.exports = router;
