const mysql = require("mysql2/promise");

// Test database connection
async function testConnection() {
  let connection;

  try {
    console.log("🔌 Testing MySQL connection...");

    // Try without password first
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // Add your MySQL root password here if needed
      database: "placement_portal",
    });

    console.log("✅ Successfully connected to MySQL!");

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Database query test successful:", rows[0]);

    // Check if tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(
      "📊 Available tables:",
      tables.map((table) => Object.values(table)[0])
    );
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 Your MySQL root user requires a password.");
      console.log(
        "   Please update the password in this script and try again."
      );
    } else if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 MySQL server is not running. Please start MySQL service."
      );
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.log('\n💡 Database "placement_portal" does not exist yet.');
      console.log("   Run the setup script first: node setup-complete-db.js");
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();


