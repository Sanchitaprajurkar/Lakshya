const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const setupDatabase = async () => {
  let connection;

  try {
    // Create connection without database first
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // Empty password for local development
    });

    console.log("Connected to MySQL server");

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log("Executed statement successfully");
        } catch (error) {
          if (
            error.code !== "ER_DB_CREATE_EXISTS" &&
            error.code !== "ER_TABLE_EXISTS_ERROR"
          ) {
            console.error("Error executing statement:", error.message);
          }
        }
      }
    }

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();

