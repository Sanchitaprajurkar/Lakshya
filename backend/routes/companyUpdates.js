const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { verifyToken } = require("./auth");

// Get all company updates (with role-based filtering)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let query, params;

    if (role === "admin") {
      // Admin can see all updates
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        ORDER BY cu.created_at DESC
      `;
      params = [];
    } else if (role === "coordinator") {
      // Coordinator can see their own updates
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        WHERE cu.coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)
        ORDER BY cu.created_at DESC
      `;
      params = [userId];
    } else {
      // Students can see only published updates
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        WHERE cu.status = 'published'
        ORDER BY cu.created_at DESC
      `;
      params = [];
    }

    const [results] = await pool.execute(query, params);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching company updates:", error);
    res.status(500).json({ error: "Failed to fetch company updates" });
  }
});

// Create new company update (coordinators only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can create company updates" });
    }

    const {
      company_name,
      job_title,
      job_description,
      requirements,
      package_details,
      eligibility_criteria,
      application_deadline,
      interview_schedule,
      location,
    } = req.body;

    // Get coordinator ID
    const [coordinators] = await pool.execute(
      "SELECT coordinator_id FROM Coordinators WHERE user_id = ?",
      [userId]
    );

    if (coordinators.length === 0) {
      return res.status(404).json({ error: "Coordinator profile not found" });
    }

    const coordinatorId = coordinators[0].coordinator_id;

    const query = `
      INSERT INTO CompanyUpdates (
        coordinator_id, company_name, job_title, job_description, requirements,
        package_details, eligibility_criteria, application_deadline,
        interview_schedule, location, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;

    const [result] = await pool.execute(query, [
      coordinatorId,
      company_name,
      job_title,
      job_description,
      requirements,
      package_details,
      eligibility_criteria,
      application_deadline,
      interview_schedule,
      location,
    ]);

    res.status(201).json({
      message: "Company update created successfully",
      update_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating company update:", error);
    res.status(500).json({ error: "Failed to create company update" });
  }
});

// Update company update status (coordinators and admin)
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (role === "coordinator") {
      // Coordinators can only submit for approval
      if (status !== "pending_approval") {
        return res
          .status(403)
          .json({ error: "Coordinators can only submit for approval" });
      }

      await pool.execute(
        "UPDATE CompanyUpdates SET status = ? WHERE update_id = ? AND coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)",
        [status, id, userId]
      );
    } else if (role === "admin") {
      // Admin can approve, reject, or publish
      await pool.execute(
        "UPDATE CompanyUpdates SET status = ?, admin_notes = ? WHERE update_id = ?",
        [status, admin_notes, id]
      );
    } else {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Get company update by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    let query, params;

    if (role === "admin") {
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        WHERE cu.update_id = ?
      `;
      params = [id];
    } else if (role === "coordinator") {
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        WHERE cu.update_id = ? AND cu.coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)
      `;
      params = [id, userId];
    } else {
      query = `
        SELECT cu.*, c.name as coordinator_name, c.department
        FROM CompanyUpdates cu
        JOIN Coordinators c ON cu.coordinator_id = c.coordinator_id
        WHERE cu.update_id = ? AND cu.status = 'published'
      `;
      params = [id];
    }

    const [results] = await pool.execute(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "Company update not found" });
    }

    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching company update:", error);
    res.status(500).json({ error: "Failed to fetch company update" });
  }
});

// Update company update (coordinators only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can update company updates" });
    }

    const {
      company_name,
      job_title,
      job_description,
      requirements,
      package_details,
      eligibility_criteria,
      application_deadline,
      interview_schedule,
      location,
    } = req.body;

    const query = `
      UPDATE CompanyUpdates SET
        company_name = ?, job_title = ?, job_description = ?, requirements = ?,
        package_details = ?, eligibility_criteria = ?, application_deadline = ?,
        interview_schedule = ?, location = ?
      WHERE update_id = ? AND coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)
    `;

    const [result] = await pool.execute(query, [
      company_name,
      job_title,
      job_description,
      requirements,
      package_details,
      eligibility_criteria,
      application_deadline,
      interview_schedule,
      location,
      id,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Company update not found or access denied" });
    }

    res.json({ message: "Company update updated successfully" });
  } catch (error) {
    console.error("Error updating company update:", error);
    res.status(500).json({ error: "Failed to update company update" });
  }
});

// Delete company update (coordinators only, if not published)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can delete company updates" });
    }

    const [result] = await pool.execute(
      "DELETE FROM CompanyUpdates WHERE update_id = ? AND coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?) AND status IN ('draft', 'rejected')",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Company update not found, access denied, or cannot be deleted",
        });
    }

    res.json({ message: "Company update deleted successfully" });
  } catch (error) {
    console.error("Error deleting company update:", error);
    res.status(500).json({ error: "Failed to delete company update" });
  }
});

module.exports = router;
