USE placement_portal;

-- Procedure to categorize students by CGPA
DELIMITER //
CREATE PROCEDURE CategorizeStudents()
BEGIN
    SELECT 
        student_id,
        name,
        email,
        branch,
        cgpa,
        CASE 
            WHEN cgpa >= 8.5 THEN 'Excellent - Top Companies'
            WHEN cgpa >= 7.0 THEN 'Good - Mid-tier Companies'
            WHEN cgpa >= 6.0 THEN 'Average - Entry Level'
            ELSE 'Needs Improvement'
        END AS placement_category,
        graduation_year
    FROM Student
    ORDER BY cgpa DESC;
END //

-- Procedure to get placement statistics
CREATE PROCEDURE GetPlacementStats()
BEGIN
    SELECT 
        COUNT(DISTINCT s.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) as placed_students,
        ROUND(
            (COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) * 100.0) / 
            COUNT(DISTINCT s.student_id), 2
        ) as placement_percentage,
        AVG(j.salary) as average_salary
    FROM Student s
    LEFT JOIN Application a ON s.student_id = a.student_id
    LEFT JOIN Job j ON a.job_id = j.job_id AND a.status = 'Selected';
END //

-- Procedure to apply for a job (with transaction)
CREATE PROCEDURE ApplyForJob(
    IN p_student_id INT,
    IN p_job_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE student_count INT DEFAULT 0;
    DECLARE job_count INT DEFAULT 0;
    DECLARE existing_application INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'Error: Application failed due to database error';
    END;
    
    START TRANSACTION;
    
    -- Check if student exists
    SELECT COUNT(*) INTO student_count FROM Student WHERE student_id = p_student_id;
    
    -- Check if job exists and is active
    SELECT COUNT(*) INTO job_count FROM Job WHERE job_id = p_job_id AND status = 'Active';
    
    -- Check if application already exists
    SELECT COUNT(*) INTO existing_application 
    FROM Application 
    WHERE student_id = p_student_id AND job_id = p_job_id;
    
    IF student_count = 0 THEN
        SET p_result = 'Error: Student not found';
        ROLLBACK;
    ELSEIF job_count = 0 THEN
        SET p_result = 'Error: Job not found or not active';
        ROLLBACK;
    ELSEIF existing_application > 0 THEN
        SET p_result = 'Error: Already applied for this job';
        ROLLBACK;
    ELSE
        INSERT INTO Application (student_id, job_id, status)
        VALUES (p_student_id, p_job_id, 'Applied');
        
        SET p_result = 'Success: Application submitted successfully';
        COMMIT;
    END IF;
END //
DELIMITER ;