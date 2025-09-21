import React, { useState, useEffect } from "react";
import {
  Send,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  X,
  CheckCircle,
} from "lucide-react";
import {
  applicationsAPI,
  jobsAPI,
  studentsAPI,
  formatDate,
  getStatusColor,
} from "../utils/api";

const ApplicationForm = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    jobId: "",
  });

  const [formData, setFormData] = useState({
    student_id: "",
    job_id: "",
    cover_letter: "",
    resume_link: "",
  });

  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const applicationStatuses = [
    "Applied",
    "Under Review",
    "Interview Scheduled",
    "Selected",
    "Rejected",
    "Withdrawn",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, jobsResponse, studentsResponse] =
        await Promise.all([
          applicationsAPI.getAll(),
          jobsAPI.getAll(),
          studentsAPI.getAll(),
        ]);

      setApplications(applicationsResponse.data);
      setJobs(jobsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student_id)
      newErrors.student_id = "Student selection is required";
    if (!formData.job_id) newErrors.job_id = "Job selection is required";
    if (!formData.cover_letter?.trim())
      newErrors.cover_letter = "Cover letter is required";

    // Check if student has already applied for this job
    const existingApplication = applications.find(
      (app) =>
        app.student_id === parseInt(formData.student_id) &&
        app.job_id === parseInt(formData.job_id)
    );

    if (existingApplication) {
      newErrors.duplicate = "This student has already applied for this job";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await applicationsAPI.create(formData);
      setSubmitSuccess(true);
      await fetchData();

      // Reset form after success
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setErrors({ submit: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      job_id: "",
      cover_letter: "",
      resume_link: "",
    });
    setErrors({});
    setSubmitSuccess(false);
    setShowForm(false);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      await fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const student = students.find((s) => s.student_id === app.student_id);
    const job = jobs.find((j) => j.job_id === app.job_id);

    const matchesSearch =
      !filters.search ||
      student?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      job?.job_title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job?.company_name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesJob = !filters.jobId || app.job_id === parseInt(filters.jobId);

    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStudent = (studentId) =>
    students.find((s) => s.student_id === studentId);
  const getJob = (jobId) => jobs.find((j) => j.job_id === jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Send className="h-4 w-4 mr-2" />
          New Application
        </button>
      </div>

      {/* Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Submit New Application
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Application Submitted!
                </h3>
                <p className="text-gray-600">
                  The application has been successfully submitted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Select Student</label>
                    <select
                      className={`form-input ${
                        errors.student_id ? "border-red-500" : ""
                      }`}
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                    >
                      <option value="">Choose a student</option>
                      {students.map((student) => (
                        <option
                          key={student.student_id}
                          value={student.student_id}
                        >
                          {student.name} - {student.student_id} (
                          {student.branch})
                        </option>
                      ))}
                    </select>
                    {errors.student_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.student_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Select Job</label>
                    <select
                      className={`form-input ${
                        errors.job_id ? "border-red-500" : ""
                      }`}
                      value={formData.job_id}
                      onChange={(e) =>
                        setFormData({ ...formData, job_id: e.target.value })
                      }
                    >
                      <option value="">Choose a job</option>
                      {jobs.map((job) => (
                        <option key={job.job_id} value={job.job_id}>
                          {job.job_title} at {job.company_name}
                        </option>
                      ))}
                    </select>
                    {errors.job_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.job_id}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Resume Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    className="form-input"
                    value={formData.resume_link}
                    onChange={(e) =>
                      setFormData({ ...formData, resume_link: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    rows={6}
                    placeholder="Write a compelling cover letter..."
                    className={`form-input ${
                      errors.cover_letter ? "border-red-500" : ""
                    }`}
                    value={formData.cover_letter}
                    onChange={(e) =>
                      setFormData({ ...formData, cover_letter: e.target.value })
                    }
                  />
                  {errors.cover_letter && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cover_letter}
                    </p>
                  )}
                </div>

                {errors.duplicate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-yellow-700 text-sm">
                      {errors.duplicate}
                    </p>
                  </div>
                )}

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, job, or company..."
                className="form-input pl-10"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          <select
            className="form-input w-full sm:w-40"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="form-input w-full sm:w-48"
            value={filters.jobId}
            onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.job_id} value={job.job_id}>
                {job.job_title} at {job.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const student = getStudent(application.student_id);
                const job = getJob(application.job_id);

                return (
                  <tr
                    key={application.application_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student?.name || "Unknown Student"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {application.student_id} • {student?.branch}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job?.job_title || "Unknown Job"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {job?.company_name || "Unknown Company"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.status}
                        onChange={(e) =>
                          updateApplicationStatus(
                            application.application_id,
                            e.target.value
                          )
                        }
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {applicationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(application.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // View application details
                            console.log("View application:", application);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {application.resume_link && (
                          <a
                            href={application.resume_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            Resume
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && !loading && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.jobId
                ? "Try adjusting your search criteria."
                : "Submit your first job application to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;
