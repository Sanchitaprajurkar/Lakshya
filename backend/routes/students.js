const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Get all students
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT s.*, 
             CASE 
               WHEN s.cgpa >= 8.5 THEN 'Excellent'
               WHEN s.cgpa >= 7.0 THEN 'Good'  
               WHEN s.cgpa >= 6.0 THEN 'Average'
               ELSE 'Below Average'
             END as placement_category
      FROM Student s
      ORDER BY s.name
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get student categories for dashboard (IMPORTANT: This route must come BEFORE /:id)
router.get("/categories", async (req, res) => {
  try {
    const query = `
      SELECT s.*,
             CASE 
               WHEN s.cgpa >= 8.5 THEN 'Excellent'
               WHEN s.cgpa >= 7.0 THEN 'Good'
               WHEN s.cgpa >= 6.0 THEN 'Average'
               ELSE 'Below Average'
             END as placement_category
      FROM Student s
      ORDER BY s.cgpa DESC
    `;

    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching student categories:", error);
    res.status(500).json({ error: "Failed to fetch student categories" });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const query = "SELECT * FROM Student WHERE student_id = ?";
    const [results] = await pool.execute(query, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// Create new student
router.post("/", async (req, res) => {
  try {
    const { student_id, name, email, branch, cgpa, graduation_year, phone } =
      req.body;

    if (
      !student_id ||
      !name ||
      !email ||
      !branch ||
      !graduation_year
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO Student (student_id, name, email, branch, cgpa, graduation_year, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      student_id,
      name,
      email,
      branch,
      cgpa || null,
      graduation_year,
      phone || null,
    ]);

    res.status(201).json({
      message: "Student created successfully",
      student_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Student ID or email already exists" });
    }
    res.status(500).json({ error: "Failed to create student" });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    const { name, email, branch, cgpa, graduation_year, phone } = req.body;

    const query = `
      UPDATE Student 
      SET name = ?, email = ?, branch = ?, cgpa = ?, graduation_year = ?, phone = ?
      WHERE student_id = ?
    `;

    const [result] = await pool.execute(query, [
      name,
      email,
      branch,
      cgpa || null,
      graduation_year,
      phone || null,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const query = "DELETE FROM Student WHERE student_id = ?";
    const [result] = await pool.execute(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;

