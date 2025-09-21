-- Authentication and User Management Schema for Lakshya Placement Portal

-- Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'coordinator', 'admin') NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student profiles (extends Users)
CREATE TABLE IF NOT EXISTS StudentProfiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    branch VARCHAR(50) NOT NULL,
    cgpa DECIMAL(3,2),
    graduation_year INT NOT NULL,
    resume_path VARCHAR(255),
    placement_status ENUM('Available', 'Interviewing', 'Placed', 'Not Interested') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Department Coordinators
CREATE TABLE IF NOT EXISTS Coordinators (
    coordinator_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Company Updates (posted by coordinators, approved by admin)
CREATE TABLE IF NOT EXISTS CompanyUpdates (
    update_id INT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    job_description TEXT,
    requirements TEXT,
    package_details VARCHAR(200),
    eligibility_criteria TEXT,
    application_deadline DATE,
    interview_schedule DATETIME,
    location VARCHAR(100),
    status ENUM('draft', 'pending_approval', 'approved', 'published', 'rejected') DEFAULT 'draft',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coordinator_id) REFERENCES Coordinators(coordinator_id) ON DELETE CASCADE
);

-- Placement Results
CREATE TABLE IF NOT EXISTS PlacementResults (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    update_id INT NOT NULL,
    coordinator_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    result_status ENUM('shortlisted', 'selected', 'rejected', 'pending') NOT NULL,
    interview_notes TEXT,
    final_package DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (update_id) REFERENCES CompanyUpdates(update_id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES Coordinators(coordinator_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES StudentProfiles(student_id) ON DELETE CASCADE
);

-- Student Applications
CREATE TABLE IF NOT EXISTS StudentApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    update_id INT NOT NULL,
    application_status ENUM('applied', 'under_review', 'shortlisted', 'selected', 'rejected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES StudentProfiles(student_id) ON DELETE CASCADE,
    FOREIGN KEY (update_id) REFERENCES CompanyUpdates(update_id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO Users (username, email, password_hash, role, department) VALUES 
('admin', 'admin@kkwieer.edu', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', 'admin', 'Administration');

-- Insert sample coordinator
INSERT INTO Users (username, email, password_hash, role, department) VALUES 
('coordinator_cs', 'coordinator.cs@kkwieer.edu', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', 'coordinator', 'Computer Science');

INSERT INTO Coordinators (user_id, department, name, phone) VALUES 
(2, 'Computer Science', 'Dr. CS Coordinator', '9876543210');

-- Insert sample student
INSERT INTO Users (username, email, password_hash, role, department) VALUES 
('student001', 'student001@kkwieer.edu', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', 'student', 'Computer Science');

INSERT INTO StudentProfiles (user_id, student_id, full_name, phone, branch, cgpa, graduation_year) VALUES 
(3, 'CS2021001', 'John Doe', '9876543211', 'Computer Science', 8.5, 2025);
