import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  User,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  applicationsAPI,
  studentsAPI,
  jobsAPI,
  companiesAPI,
  formatDate,
  formatDateTime,
} from "../utils/api";

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    student: "",
    company: "",
    dateFrom: "",
    dateTo: "",
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
      const [applicationsRes, studentsRes, jobsRes, companiesRes] =
        await Promise.all([
          applicationsAPI.getAll(),
          studentsAPI.getAll(),
          jobsAPI.getAll(),
          companiesAPI.getAll(),
        ]);

      setApplications(applicationsRes.data || []);
      setStudents(studentsRes.data || []);
      setJobs(jobsRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
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
    const company = companies.find((c) => c.company_id === job?.company_id);
    return company ? company.name : "Unknown Company";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Applied: <Clock className="h-5 w-5 text-blue-500" />,
      "Under Review": <Eye className="h-5 w-5 text-yellow-500" />,
      Shortlisted: <AlertCircle className="h-5 w-5 text-purple-500" />,
      Selected: <CheckCircle className="h-5 w-5 text-green-500" />,
      Rejected: <XCircle className="h-5 w-5 text-red-500" />,
    };
    return icons[status] || <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "Under Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      Shortlisted: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      Selected: "bg-green-500/20 text-green-400 border-green-500/50",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      Applied: "Your application has been submitted and is awaiting review.",
      "Under Review":
        "Your application is currently being reviewed by the hiring team.",
      Shortlisted:
        "Congratulations! You have been shortlisted for the next round.",
      Selected: "Congratulations! You have been selected for this position.",
      Rejected:
        "Unfortunately, your application was not selected for this position.",
    };
    return descriptions[status] || "Status information not available.";
  };

  const getNextSteps = (status) => {
    const nextSteps = {
      Applied: [
        "Wait for the application to be reviewed",
        "Check your email regularly for updates",
        "Prepare for potential interviews",
      ],
      "Under Review": [
        "Continue waiting for the review process",
        "Be ready for potential interview calls",
        "Keep your contact information updated",
      ],
      Shortlisted: [
        "Prepare for the next round of interviews",
        "Review the job requirements thoroughly",
        "Prepare questions to ask during the interview",
      ],
      Selected: [
        "Complete any required documentation",
        "Prepare for onboarding process",
        "Contact the company for next steps",
      ],
      Rejected: [
        "Don't be discouraged - keep applying",
        "Ask for feedback if possible",
        "Continue improving your skills",
      ],
    };
    return nextSteps[status] || [];
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
    const matchesCompany =
      !filters.company ||
      getCompanyName(application.job_id)
        .toLowerCase()
        .includes(filters.company.toLowerCase());

    return matchesSearch && matchesStatus && matchesStudent && matchesCompany;
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
            <FileText className="h-8 w-8 text-cyan-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Application Tracker
            </h1>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
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
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
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

              <input
                type="text"
                placeholder="Company Name"
                value={filters.company}
                onChange={(e) =>
                  setFilters({ ...filters, company: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />

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
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedApplication(application)}
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
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
              {/* Status Overview */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  {getStatusIcon(selectedApplication.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {selectedApplication.status}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {getStatusDescription(selectedApplication.status)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Student Information */}
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

                {/* Job Information */}
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

              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Application Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-400">
                        Application Submitted
                      </p>
                      <p className="text-white">
                        {formatDateTime(selectedApplication.applied_date)}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.interview_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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

                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-400">Current Status</p>
                      <p className="text-white">{selectedApplication.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Next Steps
                </h4>
                <div className="space-y-2">
                  {getNextSteps(selectedApplication.status).map(
                    (step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                        <p className="text-gray-300 text-sm">{step}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Notes
                  </h4>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-300">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
