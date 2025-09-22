-- Placement Portal Database Setup
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'coordinator', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Companies table for placement companies
CREATE TABLE IF NOT EXISTS Companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  company_description TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  location VARCHAR(255),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Jobs table for job postings
CREATE TABLE IF NOT EXISTS Jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  job_title VARCHAR(100) NOT NULL,
  job_description TEXT,
  requirements TEXT,
  salary_range VARCHAR(50),
  job_type ENUM('full-time', 'part-time', 'internship', 'contract') NOT NULL,
  location VARCHAR(255),
  application_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

-- Create Applications table for student job applications
CREATE TABLE IF NOT EXISTS Applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  job_id INT,
  status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending',
  resume_path VARCHAR(500),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_job (user_id, job_id)
);

-- Create Student_Profiles table for detailed student information
CREATE TABLE IF NOT EXISTS Student_Profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  course VARCHAR(100),
  year_of_study INT,
  cgpa DECIMAL(3,2),
  skills TEXT,
  experience TEXT,
  resume_path VARCHAR(500),
  profile_picture_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Notifications table for system notifications
CREATE TABLE IF NOT EXISTS Notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123 - change this!)
-- Note: You'll need to hash this password in your application
INSERT IGNORE INTO Users (username, email, password_hash, role, department) 
VALUES ('admin', 'admin@placement.com', '$2b$10$example_hash_here', 'admin', 'Administration');

-- Insert sample companies (optional)
INSERT IGNORE INTO Companies (company_name, company_description, website, industry, location, contact_email) 
VALUES 
('TechCorp Solutions', 'Leading technology solutions provider', 'https://techcorp.com', 'Technology', 'Mumbai, India', 'hr@techcorp.com'),
('InnovateLabs', 'Innovation and research company', 'https://innovatelabs.com', 'Research & Development', 'Bangalore, India', 'careers@innovatelabs.com');

-- Show created tables
SHOW TABLES;