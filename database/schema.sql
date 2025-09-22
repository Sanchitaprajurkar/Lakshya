-- Create Database
CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- Student Table
CREATE TABLE Student (
  student_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2) CHECK (cgpa >= 0 AND cgpa <= 10),
  graduation_year INT NOT NULL,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Table
CREATE TABLE Company (
  company_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  website VARCHAR(200),
  industry VARCHAR(100),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Table
CREATE TABLE Job (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  job_title VARCHAR(100) NOT NULL,
  description TEXT,
  salary DECIMAL(10,2),
  location VARCHAR(100),
  requirements TEXT,
  job_type ENUM('Full-time', 'Part-time', 'Internship') DEFAULT 'Full-time',
  status ENUM('Active', 'Closed') DEFAULT 'Active',
  company_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

-- Application Table
CREATE TABLE Application (
  app_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20),
  job_id INT,
  status ENUM('Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected') DEFAULT 'Applied',
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  interview_date DATE,
  notes TEXT,
  FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES Job(job_id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (student_id, job_id)
);

-- Audit Log Table
CREATE TABLE Audit_Log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  table_name VARCHAR(50),
  operation VARCHAR(20),
  record_id INT,
  old_values JSON,
  new_values JSON,
  user_info VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);