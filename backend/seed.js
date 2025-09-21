const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./backend.env" });

const seedDatabase = async () => {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "placement_portal",
    });

    console.log("Connected to database");

    // Insert sample companies
    const companies = [
      {
        name: "TechCorp Solutions",
        email: "hr@techcorp.com",
        website: "https://www.techcorp.com",
        industry: "Technology",
        location: "Bangalore, India",
      },
      {
        name: "DataVision Analytics",
        email: "careers@datavision.com",
        website: "https://www.datavision.com",
        industry: "Technology",
        location: "Mumbai, India",
      },
      {
        name: "InnovateLabs",
        email: "jobs@innovatelabs.com",
        website: "https://www.innovatelabs.com",
        industry: "Technology",
        location: "Pune, India",
      },
      {
        name: "CloudTech Systems",
        email: "hr@cloudtech.com",
        website: "https://www.cloudtech.com",
        industry: "Technology",
        location: "Hyderabad, India",
      },
      {
        name: "AI Dynamics",
        email: "careers@aidynamics.com",
        website: "https://www.aidynamics.com",
        industry: "Technology",
        location: "Chennai, India",
      },
    ];

    console.log("Inserting companies...");
    for (const company of companies) {
      await connection.execute(
        "INSERT INTO Company (name, email, website, industry, location) VALUES (?, ?, ?, ?, ?)",
        [
          company.name,
          company.email,
          company.website,
          company.industry,
          company.location,
        ]
      );
    }

    // Insert sample students
    const students = [
      {
        student_id: "CS21001",
        name: "Arjun Sharma",
        email: "arjun.sharma@college.edu",
        phone: "+91 9876543210",
        branch: "CSE",
        cgpa: 8.5,
        graduation_year: 2024,
      },
      {
        student_id: "EC21015",
        name: "Priya Patel",
        email: "priya.patel@college.edu",
        phone: "+91 9876543211",
        branch: "ECE",
        cgpa: 9.2,
        graduation_year: 2024,
      },
      {
        student_id: "ME21045",
        name: "Rahul Kumar",
        email: "rahul.kumar@college.edu",
        phone: "+91 9876543212",
        branch: "ME",
        cgpa: 7.8,
        graduation_year: 2024,
      },
      {
        student_id: "EE21030",
        name: "Sneha Reddy",
        email: "sneha.reddy@college.edu",
        phone: "+91 9876543213",
        branch: "EE",
        cgpa: 8.1,
        graduation_year: 2024,
      },
      {
        student_id: "CS21020",
        name: "Vikram Singh",
        email: "vikram.singh@college.edu",
        phone: "+91 9876543214",
        branch: "CSE",
        cgpa: 8.9,
        graduation_year: 2024,
      },
    ];

    console.log("Inserting students...");
    for (const student of students) {
      await connection.execute(
        "INSERT INTO Student (student_id, name, email, phone, branch, cgpa, graduation_year) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          student.student_id,
          student.name,
          student.email,
          student.phone,
          student.branch,
          student.cgpa,
          student.graduation_year,
        ]
      );
    }

    // Get company IDs for jobs
    const [companyRows] = await connection.execute(
      "SELECT company_id, name FROM Company"
    );
    const companyMap = {};
    companyRows.forEach((row) => {
      companyMap[row.name] = row.company_id;
    });

    // Insert sample jobs
    const jobs = [
      {
        job_title: "Software Engineer",
        description:
          "Join our dynamic team to build cutting-edge software solutions.",
        requirements:
          "Bachelor's degree in Computer Science, 2+ years experience",
        location: "Bangalore, India",
        job_type: "Full-time",
        salary: 1200000,
        company_id: companyMap["TechCorp Solutions"],
      },
      {
        job_title: "Data Analyst Intern",
        description: "Analyze data trends and create insightful reports.",
        requirements: "Currently pursuing degree in relevant field",
        location: "Mumbai, India",
        job_type: "Internship",
        salary: 20000,
        company_id: companyMap["DataVision Analytics"],
      },
      {
        job_title: "Product Manager",
        description: "Lead product development from conception to launch.",
        requirements: "MBA preferred, 5+ years product management experience",
        location: "Pune, India",
        job_type: "Full-time",
        salary: 2000000,
        company_id: companyMap["InnovateLabs"],
      },
      {
        job_title: "DevOps Engineer",
        description: "Manage cloud infrastructure and deployment pipelines.",
        requirements: "Experience with AWS, Docker, Kubernetes",
        location: "Hyderabad, India",
        job_type: "Full-time",
        salary: 1500000,
        company_id: companyMap["CloudTech Systems"],
      },
      {
        job_title: "AI/ML Engineer",
        description: "Develop machine learning models and AI solutions.",
        requirements: "Strong background in machine learning and Python",
        location: "Chennai, India",
        job_type: "Full-time",
        salary: 1800000,
        company_id: companyMap["AI Dynamics"],
      },
    ];

    console.log("Inserting jobs...");
    for (const job of jobs) {
      await connection.execute(
        "INSERT INTO Job (job_title, description, requirements, location, job_type, salary, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          job.job_title,
          job.description,
          job.requirements,
          job.location,
          job.job_type,
          job.salary,
          job.company_id,
        ]
      );
    }

    // Get student and job IDs for applications
    const [studentRows] = await connection.execute(
      "SELECT student_id FROM Student"
    );
    const [jobRows] = await connection.execute("SELECT job_id FROM Job");

    // Insert sample applications
    const applications = [
      {
        student_id: studentRows[0].student_id,
        job_id: jobRows[0].job_id,
        status: "Applied",
        notes: "Interested in software development role",
      },
      {
        student_id: studentRows[1].student_id,
        job_id: jobRows[1].job_id,
        status: "Selected",
        notes: "Excellent performance in interview",
      },
      {
        student_id: studentRows[2].student_id,
        job_id: jobRows[2].job_id,
        status: "Under Review",
        notes: "Application under consideration",
      },
      {
        student_id: studentRows[3].student_id,
        job_id: jobRows[3].job_id,
        status: "Shortlisted",
        notes: "Shortlisted for technical round",
      },
      {
        student_id: studentRows[4].student_id,
        job_id: jobRows[4].job_id,
        status: "Applied",
        notes: "Looking forward to AI/ML opportunities",
      },
    ];

    console.log("Inserting applications...");
    for (const application of applications) {
      await connection.execute(
        "INSERT INTO Application (student_id, job_id, status, notes) VALUES (?, ?, ?, ?)",
        [
          application.student_id,
          application.job_id,
          application.status,
          application.notes,
        ]
      );
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

seedDatabase();

