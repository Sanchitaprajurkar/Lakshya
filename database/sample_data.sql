USE placement_portal;

-- Sample Companies
INSERT INTO Company (name, email, website, industry, location) VALUES
('TechCorp Solutions', 'hr@techcorp.com', 'www.techcorp.com', 'Software', 'Bangalore'),
('DataFlow Systems', 'careers@dataflow.com', 'www.dataflow.com', 'Analytics', 'Mumbai'),
('CloudNine Technologies', 'jobs@cloudnine.com', 'www.cloudnine.com', 'Cloud Computing', 'Hyderabad');

-- Sample Students
INSERT INTO Student (student_id, name, email, branch, cgpa, graduation_year, phone) VALUES
(2021001, 'Rahul Sharma', 'rahul.sharma@student.edu', 'Computer Science', 8.5, 2025, '9876543210'),
(2021002, 'Priya Patel', 'priya.patel@student.edu', 'Information Technology', 9.2, 2025, '9876543211'),
(2021003, 'Amit Kumar', 'amit.kumar@student.edu', 'Electronics', 7.8, 2025, '9876543212'),
(2021004, 'Sneha Singh', 'sneha.singh@student.edu', 'Computer Science', 8.9, 2025, '9876543213');

-- Sample Jobs
INSERT INTO Job (job_title, description, salary, location, requirements, company_id) VALUES
('Software Developer', 'Develop web applications using modern frameworks', 600000, 'Bangalore', 'React, Node.js, MongoDB', 1),
('Data Analyst', 'Analyze business data and create insights', 550000, 'Mumbai', 'Python, SQL, Tableau', 2),
('Cloud Engineer', 'Design and maintain cloud infrastructure', 700000, 'Hyderabad', 'AWS, Docker, Kubernetes', 3),
('Full Stack Developer', 'End-to-end web development', 650000, 'Bangalore', 'MERN Stack, Git', 1);

-- Sample Applications
INSERT INTO Application (student_id, job_id, status) VALUES
(2021001, 1, 'Selected'),
(2021002, 2, 'Under Review'),
(2021003, 3, 'Applied'),
(2021004, 1, 'Shortlisted');