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

async function setupDatabase() {
  let connection;

  try {
    console.log("🔌 Connecting to MySQL...");
    connection = await mysql.createConnection(config);
    console.log("✅ Connected to MySQL successfully");

    // Create database first
    console.log("📋 Creating database...");
    await connection.query("CREATE DATABASE IF NOT EXISTS placement_portal");
    await connection.query("USE placement_portal");
    console.log("✅ Database created successfully");

    // Read and execute schema.sql (without USE statement)
    console.log("📋 Setting up database schema...");
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    let schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Remove the CREATE DATABASE and USE statements since we already did them
    schemaSQL = schemaSQL.replace(
      /CREATE DATABASE IF NOT EXISTS placement_portal;\s*USE placement_portal;\s*/i,
      ""
    );

    await connection.query(schemaSQL);
    console.log("✅ Database schema created successfully");

    // Read and execute sample_data.sql
    console.log("🌱 Inserting sample data...");
    const sampleDataPath = path.join(__dirname, "../database/sample_data.sql");
    const sampleDataSQL = fs.readFileSync(sampleDataPath, "utf8");
    await connection.query(sampleDataSQL);
    console.log("✅ Sample data inserted successfully");

    // Read and execute procedures.sql
    console.log("⚙️ Setting up stored procedures...");
    const proceduresPath = path.join(__dirname, "../database/procedures.sql");
    const proceduresSQL = fs.readFileSync(proceduresPath, "utf8");
    await connection.query(proceduresSQL);
    console.log("✅ Stored procedures created successfully");

    // Read and execute triggers.sql
    console.log("🔧 Setting up triggers...");
    const triggersPath = path.join(__dirname, "../database/triggers.sql");
    const triggersSQL = fs.readFileSync(triggersPath, "utf8");
    await connection.query(triggersSQL);
    console.log("✅ Triggers created successfully");

    // Verify the setup
    console.log("🔍 Verifying database setup...");
    const [tables] = await connection.query("SHOW TABLES");
    console.log(
      "📊 Tables created:",
      tables.map((table) => Object.values(table)[0])
    );

    // Check data counts
    const [studentCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Student"
    );
    const [companyCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Company"
    );
    const [jobCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Job"
    );
    const [applicationCount] = await connection.query(
      "SELECT COUNT(*) as count FROM Application"
    );

    console.log("📈 Data inserted:");
    console.log(`   - Students: ${studentCount[0].count}`);
    console.log(`   - Companies: ${companyCount[0].count}`);
    console.log(`   - Jobs: ${jobCount[0].count}`);
    console.log(`   - Applications: ${applicationCount[0].count}`);

    console.log("\n🎉 Database setup completed successfully!");
    console.log(
      "🚀 You can now start the backend server and add real data through the frontend."
    );
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
setupDatabase();


