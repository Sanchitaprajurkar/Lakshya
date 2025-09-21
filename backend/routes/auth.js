const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { pool } = require("../config/database");

const JWT_SECRET =
  process.env.JWT_SECRET || "lakshya_placement_secret_key_2024";

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, department, studentData } =
      req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const [existingUser] = await pool.execute(
      "SELECT user_id FROM Users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userResult] = await pool.execute(
      "INSERT INTO Users (username, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)",
      [username, email, passwordHash, role, department || null]
    );

    const userId = userResult.insertId;

    // Create role-specific profile
    if (role === "student" && studentData) {
      const { student_id, full_name, phone, branch, cgpa, graduation_year } =
        studentData;

      await pool.execute(
        "INSERT INTO StudentProfiles (user_id, student_id, full_name, phone, branch, cgpa, graduation_year) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          student_id,
          full_name,
          phone,
          branch,
          cgpa || null,
          graduation_year,
        ]
      );
    } else if (role === "coordinator") {
      const { name, phone } = req.body;
      await pool.execute(
        "INSERT INTO Coordinators (user_id, department, name, phone) VALUES (?, ?, ?, ?)",
        [userId, department, name, phone || null]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, username, email, role, department },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        userId,
        username,
        email,
        role,
        department,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user
    const [users] = await pool.execute(
      "SELECT user_id, username, email, password_hash, role, department, is_active FROM Users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get current user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    let profile = null;

    if (role === "student") {
      const [studentProfiles] = await pool.execute(
        "SELECT sp.*, u.username, u.email FROM StudentProfiles sp JOIN Users u ON sp.user_id = u.user_id WHERE u.user_id = ?",
        [userId]
      );
      profile = studentProfiles[0];
    } else if (role === "coordinator") {
      const [coordinators] = await pool.execute(
        "SELECT c.*, u.username, u.email FROM Coordinators c JOIN Users u ON c.user_id = u.user_id WHERE u.user_id = ?",
        [userId]
      );
      profile = coordinators[0];
    } else if (role === "admin") {
      const [admins] = await pool.execute(
        "SELECT user_id, username, email, role, department FROM Users WHERE user_id = ?",
        [userId]
      );
      profile = admins[0];
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const updateData = req.body;

    if (role === "student") {
      const { full_name, phone, cgpa, placement_status } = updateData;
      await pool.execute(
        "UPDATE StudentProfiles SET full_name = ?, phone = ?, cgpa = ?, placement_status = ? WHERE user_id = ?",
        [full_name, phone, cgpa, placement_status, userId]
      );
    } else if (role === "coordinator") {
      const { name, phone } = updateData;
      await pool.execute(
        "UPDATE Coordinators SET name = ?, phone = ? WHERE user_id = ?",
        [name, phone, userId]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = { router, verifyToken };
