// backend/server.js - Corrected for your existing structure
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const { testConnection } = require("./config/database");

// Import routes
const studentRoutes = require("./routes/students");
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const { router: authRoutes } = require("./routes/auth");
const companyUpdatesRoutes = require("./routes/companyUpdates");
const resultsRoutes = require("./routes/results");

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 5000 to 3001 to match your backend port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test database connection
testConnection();

// Root route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Lakshya Placement Portal API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/company-updates", companyUpdatesRoutes);
app.use("/api/results", resultsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});

// Export app for testing purposes
module.exports = app;
