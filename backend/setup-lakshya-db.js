const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Database configuration
const config = {
  host: "localhost",
  user: "root",
  password: "Aaibaba@7579",
  multipleStatements: true,
};

async function setupLakshyaDatabase() {
  let connection;

  try {
    console.log("🔌 Connecting to MySQL...");
    connection = await mysql.createConnection(config);
    console.log("✅ Connected to MySQL successfully");

    // Create database first
    console.log("📋 Creating Lakshya database...");
    await connection.query("CREATE DATABASE IF NOT EXISTS lakshya_placement");
    await connection.query("USE lakshya_placement");
    console.log("✅ Database created successfully");

    // Read and execute auth_schema.sql
    console.log("📋 Setting up authentication schema...");
    const authSchemaPath = path.join(__dirname, "../database/auth_schema.sql");
    const authSchemaSQL = fs.readFileSync(authSchemaPath, "utf8");
    await connection.query(authSchemaSQL);
    console.log("✅ Authentication schema created successfully");

    // Verify the setup
    console.log("🔍 Verifying database setup...");
    const [tables] = await connection.query("SHOW TABLES");
    console.log(
      "📊 Tables created:",
      tables.map((table) => Object.values(table)[0])
    );

    // Check data counts
    const [userCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Users"
    );
    const [studentCount] = await connection.query(
      "SELECT COUNT(*) as count FROM StudentProfiles"
    );
    const [coordinatorCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Coordinators"
    );

    console.log("📈 Data inserted:");
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Student Profiles: ${studentCount[0].count}`);
    console.log(`   - Coordinators: ${coordinatorCount[0].count}`);

    console.log("\n🎉 Lakshya database setup completed successfully!");
    console.log("🚀 You can now start the backend server with authentication.");
    console.log("\n📝 Default credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Coordinator: coordinator_cs / coordinator123");
    console.log("   Student: student001 / student123");
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 Please check your MySQL password and try again.");
    } else if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 MySQL server is not running. Please start MySQL service."
      );
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the setup
setupLakshyaDatabase();
