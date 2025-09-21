const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { verifyToken } = require("./auth");

// Get placement results (role-based access)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let query, params;

    if (role === "admin") {
      // Admin can see all results
      query = `
        SELECT pr.*, cu.company_name, cu.job_title, sp.full_name as student_name, sp.student_id,
               c.name as coordinator_name, c.department
        FROM PlacementResults pr
        JOIN CompanyUpdates cu ON pr.update_id = cu.update_id
        JOIN StudentProfiles sp ON pr.student_id = sp.student_id
        JOIN Coordinators c ON pr.coordinator_id = c.coordinator_id
        ORDER BY pr.created_at DESC
      `;
      params = [];
    } else if (role === "coordinator") {
      // Coordinator can see results for their department
      query = `
        SELECT pr.*, cu.company_name, cu.job_title, sp.full_name as student_name, sp.student_id,
               c.name as coordinator_name, c.department
        FROM PlacementResults pr
        JOIN CompanyUpdates cu ON pr.update_id = cu.update_id
        JOIN StudentProfiles sp ON pr.student_id = sp.student_id
        JOIN Coordinators c ON pr.coordinator_id = c.coordinator_id
        WHERE pr.coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)
        ORDER BY pr.created_at DESC
      `;
      params = [userId];
    } else {
      // Students can see their own results
      query = `
        SELECT pr.*, cu.company_name, cu.job_title, sp.full_name as student_name, sp.student_id,
               c.name as coordinator_name, c.department
        FROM PlacementResults pr
        JOIN CompanyUpdates cu ON pr.update_id = cu.update_id
        JOIN StudentProfiles sp ON pr.student_id = sp.student_id
        JOIN Coordinators c ON pr.coordinator_id = c.coordinator_id
        WHERE pr.student_id = (SELECT student_id FROM StudentProfiles WHERE user_id = ?)
        ORDER BY pr.created_at DESC
      `;
      params = [userId];
    }

    const [results] = await pool.execute(query, params);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching placement results:", error);
    res.status(500).json({ error: "Failed to fetch placement results" });
  }
});

// Create placement result (coordinators only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can create placement results" });
    }

    const {
      update_id,
      student_id,
      result_status,
      interview_notes,
      final_package,
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

    // Check if result already exists
    const [existingResults] = await pool.execute(
      "SELECT result_id FROM PlacementResults WHERE update_id = ? AND student_id = ?",
      [update_id, student_id]
    );

    if (existingResults.length > 0) {
      return res
        .status(400)
        .json({
          error: "Result already exists for this student and company update",
        });
    }

    const query = `
      INSERT INTO PlacementResults (
        update_id, coordinator_id, student_id, result_status, interview_notes, final_package
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      update_id,
      coordinatorId,
      student_id,
      result_status,
      interview_notes,
      final_package,
    ]);

    res.status(201).json({
      message: "Placement result created successfully",
      result_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating placement result:", error);
    res.status(500).json({ error: "Failed to create placement result" });
  }
});

// Update placement result (coordinators only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can update placement results" });
    }

    const { result_status, interview_notes, final_package } = req.body;

    const query = `
      UPDATE PlacementResults SET
        result_status = ?, interview_notes = ?, final_package = ?
      WHERE result_id = ? AND coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)
    `;

    const [result] = await pool.execute(query, [
      result_status,
      interview_notes,
      final_package,
      id,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Result not found or access denied" });
    }

    res.json({ message: "Placement result updated successfully" });
  } catch (error) {
    console.error("Error updating placement result:", error);
    res.status(500).json({ error: "Failed to update placement result" });
  }
});

// Get students for a specific company update (coordinators only)
router.get("/students/:updateId", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { updateId } = req.params;

    if (role !== "coordinator") {
      return res
        .status(403)
        .json({ error: "Only coordinators can access this information" });
    }

    // Get students who applied for this company update
    const query = `
      SELECT sa.*, sp.full_name, sp.student_id, sp.branch, sp.cgpa, sp.graduation_year,
             pr.result_status, pr.interview_notes, pr.final_package
      FROM StudentApplications sa
      JOIN StudentProfiles sp ON sa.student_id = sp.student_id
      LEFT JOIN PlacementResults pr ON sa.update_id = pr.update_id AND sa.student_id = pr.student_id
      WHERE sa.update_id = ?
      ORDER BY sa.applied_at DESC
    `;

    const [results] = await pool.execute(query, [updateId]);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching students for company update:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get dashboard statistics
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let stats = {};

    if (role === "admin") {
      // Admin dashboard stats
      const [totalStudents] = await pool.execute(
        "SELECT COUNT(*) as count FROM StudentProfiles"
      );
      const [totalCoordinators] = await pool.execute(
        "SELECT COUNT(*) as count FROM Coordinators"
      );
      const [totalUpdates] = await pool.execute(
        "SELECT COUNT(*) as count FROM CompanyUpdates"
      );
      const [totalResults] = await pool.execute(
        "SELECT COUNT(*) as count FROM PlacementResults"
      );
      const [placedStudents] = await pool.execute(
        "SELECT COUNT(*) as count FROM PlacementResults WHERE result_status = 'selected'"
      );

      stats = {
        totalStudents: totalStudents[0].count,
        totalCoordinators: totalCoordinators[0].count,
        totalUpdates: totalUpdates[0].count,
        totalResults: totalResults[0].count,
        placedStudents: placedStudents[0].count,
      };
    } else if (role === "coordinator") {
      // Coordinator dashboard stats
      const coordinatorId = await pool.execute(
        "SELECT coordinator_id FROM Coordinators WHERE user_id = ?",
        [userId]
      );

      const [departmentStudents] = await pool.execute(
        "SELECT COUNT(*) as count FROM StudentProfiles sp JOIN Users u ON sp.user_id = u.user_id WHERE u.department = (SELECT department FROM Coordinators WHERE user_id = ?)",
        [userId]
      );

      const [myUpdates] = await pool.execute(
        "SELECT COUNT(*) as count FROM CompanyUpdates WHERE coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)",
        [userId]
      );

      const [myResults] = await pool.execute(
        "SELECT COUNT(*) as count FROM PlacementResults WHERE coordinator_id = (SELECT coordinator_id FROM Coordinators WHERE user_id = ?)",
        [userId]
      );

      stats = {
        departmentStudents: departmentStudents[0].count,
        myUpdates: myUpdates[0].count,
        myResults: myResults[0].count,
      };
    } else {
      // Student dashboard stats
      const [myApplications] = await pool.execute(
        "SELECT COUNT(*) as count FROM StudentApplications WHERE student_id = (SELECT student_id FROM StudentProfiles WHERE user_id = ?)",
        [userId]
      );

      const [myResults] = await pool.execute(
        "SELECT COUNT(*) as count FROM PlacementResults WHERE student_id = (SELECT student_id FROM StudentProfiles WHERE user_id = ?)",
        [userId]
      );

      const [selectedCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM PlacementResults WHERE student_id = (SELECT student_id FROM StudentProfiles WHERE user_id = ?) AND result_status = 'selected'",
        [userId]
      );

      stats = {
        myApplications: myApplications[0].count,
        myResults: myResults[0].count,
        selectedCount: selectedCount[0].count,
      };
    }

    res.json({ data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

module.exports = router;
