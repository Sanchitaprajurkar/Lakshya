const mysql = require("mysql2/promise");
require("dotenv").config(); // Remove the path parameter

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "placement_portal", // Match your .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully to:", process.env.DB_NAME);
    await connection.execute("SELECT 1"); // Test query
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
