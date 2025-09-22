import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Building,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  applicationsAPI,
  studentsAPI,
  jobsAPI,
  formatDate,
  formatDateTime,
  getStatusColor,
} from "../utils/api";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    student: "",
    job: "",
    dateFrom: "",
    dateTo: "",
  });

  const [applicationForm, setApplicationForm] = useState({
    student_id: "",
    job_id: "",
    notes: "",
  });

  const statusOptions = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Rejected",
    "Selected",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicationsRes, studentsRes, jobsRes] = await Promise.all([
        applicationsAPI.getAll(),
        studentsAPI.getAll(),
        jobsAPI.getAll(),
      ]);

      setApplications(applicationsRes.data || []);
      setStudents(studentsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = async () => {
    try {
      if (!applicationForm.student_id || !applicationForm.job_id) {
        alert("Please select both student and job");
        return;
      }

      await applicationsAPI.create(applicationForm);
      await fetchData();
      resetForm();
      setShowAddApplication(false);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Failed to create application:", error);
      alert("Failed to submit application: " + error.message);
    }
  };

  const handleUpdateStatus = async (
    applicationId,
    newStatus,
    interviewDate = null,
    notes = ""
  ) => {
    try {
      await applicationsAPI.updateStatus(applicationId, {
        status: newStatus,
        interview_date: interviewDate,
        notes: notes,
      });
      await fetchData();
      alert("Application status updated successfully!");
    } catch (error) {
      console.error("Failed to update application:", error);
      alert("Failed to update application: " + error.message);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      await applicationsAPI.delete(applicationId);
      await fetchData();
      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert("Failed to delete application: " + error.message);
    }
  };

  const resetForm = () => {
    setApplicationForm({
      student_id: "",
      job_id: "",
      notes: "",
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.student_id === studentId);
    return student ? student.name : "Unknown Student";
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find((j) => j.job_id === jobId);
    return job ? job.job_title : "Unknown Job";
  };

  const getCompanyName = (jobId) => {
    const job = jobs.find((j) => j.job_id === jobId);
    return job ? job.company_name : "Unknown Company";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Applied: <Clock className="h-4 w-4" />,
      "Under Review": <Eye className="h-4 w-4" />,
      Shortlisted: <AlertCircle className="h-4 w-4" />,
      Selected: <CheckCircle className="h-4 w-4" />,
      Rejected: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      getStudentName(application.student_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getJobTitle(application.job_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getCompanyName(application.job_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filters.status || application.status === filters.status;
    const matchesStudent =
      !filters.student || application.student_id === filters.student;
    const matchesJob = !filters.job || application.job_id === filters.job;

    return matchesSearch && matchesStatus && matchesStudent && matchesJob;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Application Management
            </h1>
          </div>
          <button
            onClick={() => setShowAddApplication(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by student, job, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filters.student}
                onChange={(e) =>
                  setFilters({ ...filters, student: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.job}
                onChange={(e) =>
                  setFilters({ ...filters, job: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.job_title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Applications List */}
      <div className="px-6 pb-6">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No applications found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.app_id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {getStudentName(application.student_id)}
                      </h3>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-300">
                        {getJobTitle(application.job_id)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Building className="h-4 w-4" />
                      <span>{getCompanyName(application.job_id)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusIcon(application.status)}
                      <span>{application.status}</span>
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteApplication(application.app_id)
                        }
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    Applied: {formatDateTime(application.applied_date)}
                  </span>
                  {application.interview_date && (
                    <span>
                      Interview: {formatDate(application.interview_date)}
                    </span>
                  )}
                </div>

                {application.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-300">{application.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">New Application</h2>
              <button
                onClick={() => {
                  setShowAddApplication(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student *
                </label>
                <select
                  value={applicationForm.student_id}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      student_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.name} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job *
                </label>
                <select
                  value={applicationForm.job_id}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      job_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Job</option>
                  {jobs.map((job) => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.job_title} - {job.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={applicationForm.notes}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddApplication(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApplication}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                >
                  <Save className="h-4 w-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Application Details
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Student Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="text-white">
                        {getStudentName(selectedApplication.student_id)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Job Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Position</p>
                      <p className="text-white">
                        {getJobTitle(selectedApplication.job_id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Company</p>
                      <p className="text-white">
                        {getCompanyName(selectedApplication.job_id)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Application Status
                </h4>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2 ${getStatusColor(
                      selectedApplication.status
                    )}`}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    <span>{selectedApplication.status}</span>
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Applied</p>
                      <p className="text-white">
                        {formatDateTime(selectedApplication.applied_date)}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.interview_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">
                          Interview Scheduled
                        </p>
                        <p className="text-white">
                          {formatDate(selectedApplication.interview_date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Notes
                  </h4>
                  <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const newStatus = prompt(
                      "Enter new status:",
                      selectedApplication.status
                    );
                    if (newStatus && newStatus !== selectedApplication.status) {
                      handleUpdateStatus(selectedApplication.app_id, newStatus);
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;


