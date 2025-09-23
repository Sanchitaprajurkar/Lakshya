// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  console.log("🔐 Login attempt received:", { username: req.body.username });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }
    
    // Find user in the Users table
    const [users] = await pool.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      console.log("❌ User not found:", username);
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const user = users[0];
    console.log("✅ User found:", {
      id: user.user_id,
      username: user.username,
      role: user.role,
    });

    // Compare password (using bcrypt)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log("❌ Invalid password for user:", username);
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "lakshya-placement-secret-2024",
      { expiresIn: "24h" }
    );

    // Get additional user details based on role
    let additionalDetails = {};

    try {
      if (user.role === "student") {
        const [studentDetails] = await pool.execute(
          "SELECT * FROM StudentProfiles WHERE user_id = ?",
          [user.user_id]
        );
        additionalDetails = studentDetails[0] || {};
      } else if (user.role === "coordinator") {
        const [coordinatorDetails] = await pool.execute(
          "SELECT * FROM Coordinators WHERE user_id = ?",
          [user.user_id]
        );
        additionalDetails = coordinatorDetails[0] || {};
      } else if (user.role === "admin") {
        const [adminDetails] = await pool.execute(
          "SELECT * FROM Users WHERE user_id = ? AND role = 'admin'",
          [user.user_id]
        );
        additionalDetails = adminDetails[0] || {};
      }
    } catch (detailsError) {
      console.log(
        "⚠️  Could not fetch additional details:",
        detailsError.message
      );
      // Continue without additional details
    }

    console.log("🎉 Login successful for:", username);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        ...additionalDetails,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Get current user info (protected route)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT user_id, username, email, role FROM Users WHERE user_id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "lakshya-placement-secret-2024",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
}

// Registration endpoint
router.post("/register", upload.single("resume"), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const studentData = req.body.studentData ? JSON.parse(req.body.studentData) : null;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        error: "Username, email, password, and role are required",
      });
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM Users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "Username or email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user
      const [userResult] = await connection.execute(
        "INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, role]
      );

      const userId = userResult.insertId;

      // If student role, insert student profile
      if (role === "student" && studentData) {
        const { student_id, full_name, phone, branch, cgpa, graduation_year } = studentData;
        
        // Check if student_id already exists
        const [existingStudents] = await connection.execute(
          "SELECT * FROM StudentProfiles WHERE student_id = ?",
          [student_id]
        );

        if (existingStudents.length > 0) {
          await connection.rollback();
          return res.status(400).json({
            error: "Student ID already exists",
          });
        }

        // Insert student profile
        let resumePath = null;
        if (req.file) {
          resumePath = `/uploads/resumes/${req.file.filename}`;
        }

        await connection.execute(
          "INSERT INTO StudentProfiles (user_id, student_id, full_name, phone, branch, cgpa, graduation_year, resume_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [userId, student_id, full_name, phone, branch, cgpa, graduation_year, resumePath]
        );
      }

      // Commit transaction
      await connection.commit();
      
      res.status(201).json({
        message: "Registration successful",
        userId,
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || "lakshya-placement-secret-2024";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Export the verifyToken middleware for use in other routes
const verifyToken = authenticateToken;

module.exports = { router, verifyToken };
