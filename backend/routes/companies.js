const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Get all companies
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM Company ORDER BY name";
    const [results] = await pool.execute(query);
    res.json({ data: results });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// Get company by ID
router.get("/:id", async (req, res) => {
  try {
    const query = "SELECT * FROM Company WHERE company_id = ?";
    const [results] = await pool.execute(query, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ data: results[0] });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// Create new company
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      website,
      industry,
      location,
    } = req.body;

    if (!name || !email || !industry || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO Company (name, email, website, industry, location) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      name,
      email,
      website,
      industry,
      location,
    ]);

    res.status(201).json({
      message: "Company created successfully",
      company_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Company email already exists" });
    }
    res.status(500).json({ error: "Failed to create company" });
  }
});

// Update company
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      website,
      industry,
      location,
    } = req.body;

    const query = `
      UPDATE Company 
      SET name = ?, email = ?, website = ?, industry = ?, location = ?
      WHERE company_id = ?
    `;

    const [result] = await pool.execute(query, [
      name,
      email,
      website,
      industry,
      location,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company updated successfully" });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// Delete company
router.delete("/:id", async (req, res) => {
  try {
    const query = "DELETE FROM Company WHERE company_id = ?";
    const [result] = await pool.execute(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

module.exports = router;
