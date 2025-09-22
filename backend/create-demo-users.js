const bcrypt = require("bcrypt");
const { pool } = require("./config/database");

async function createDemoUsers() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const coordinatorPassword = await bcrypt.hash("coordinator123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    // Insert demo users
    const users = [
      {
        username: "admin",
        email: "admin@kkwieer.edu.in",
        password: adminPassword,
        role: "admin",
      },
      {
        username: "coordinator_cs",
        email: "coordinator.cs@kkwieer.edu.in",
        password: coordinatorPassword,
        role: "coordinator",
      },
      {
        username: "student001",
        email: "student001@kkwieer.edu.in",
        password: studentPassword,
        role: "student",
      },
    ];

    for (const user of users) {
      await pool.execute(
        "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE password = VALUES(password)",
        [user.username, user.email, user.password, user.role]
      );
      console.log(`✅ Created/Updated user: ${user.username}`);
    }

    console.log("Demo users created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating demo users:", error);
    process.exit(1);
  }
}

createDemoUsers();
