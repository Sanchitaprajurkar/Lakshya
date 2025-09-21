USE placement_portal;

-- Trigger for Student Updates
DELIMITER //
CREATE TRIGGER student_audit_trigger
AFTER UPDATE ON Student
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Log (table_name, operation, record_id, old_values, new_values)
    VALUES (
        'Student', 
        'UPDATE', 
        NEW.student_id,
        JSON_OBJECT('name', OLD.name, 'email', OLD.email, 'cgpa', OLD.cgpa),
        JSON_OBJECT('name', NEW.name, 'email', NEW.email, 'cgpa', NEW.cgpa)
    );
END //

-- Trigger for Application Status Updates
CREATE TRIGGER application_status_trigger
AFTER UPDATE ON Application
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO Audit_Log (table_name, operation, record_id, old_values, new_values)
        VALUES (
            'Application', 
            'STATUS_UPDATE', 
            NEW.app_id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status, 'student_id', NEW.student_id, 'job_id', NEW.job_id)
        );
    END IF;
END //
DELIMITER ;