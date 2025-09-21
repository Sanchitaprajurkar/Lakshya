import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building,
  ExternalLink,
  Plus,
  X,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import { jobsAPI, companiesAPI, formatDate, formatSalary } from "../utils/api";

// Utility functions for UI styling
const getJobTypeColor = (type) => {
  const colors = {
    "Full-time": "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    "Part-time": "bg-blue-500/20 text-blue-400 border-blue-500/50",
    Internship: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    Contract: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };
  return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({
    company: "",
    location: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    skills: "",
  });

  const [newJob, setNewJob] = useState({
    job_title: "",
    company_id: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "Full-time",
    salary: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getAll();
      setJobs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll();
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      setCompanies([]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        q: searchTerm,
        ...filters,
      };
      const response = await jobsAPI.search(searchFilters);
      setJobs(response);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      await jobsAPI.create(newJob);
      await fetchJobs();
      setShowAddJob(false);
      setNewJob({
        job_title: "",
        company_id: "",
        description: "",
        requirements: "",
        location: "",
        job_type: "Full-time",
        salary: "",
      });
      alert("Job added successfully!");
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("Failed to add job: " + error.message);
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.company_id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(job.company_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Job Opportunities
            </h1>
          </div>
          <button
            onClick={() => setShowAddJob(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
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
              placeholder="Search jobs, companies, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.company}
                onChange={(e) =>
                  setFilters({ ...filters, company: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />

              <select
                value={filters.jobType}
                onChange={(e) =>
                  setFilters({ ...filters, jobType: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <input
                type="text"
                placeholder="Skills"
                value={filters.skills}
                onChange={(e) =>
                  setFilters({ ...filters, skills: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="px-6 pb-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No jobs found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                      {job.job_title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">
                        {getCompanyName(job.company_id)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(
                      job.job_type
                    )}`}
                  >
                    {job.job_type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>

                  {job.salary && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job.salary)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Posted {formatDate(job.created_at)}
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-500 hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Add New Job</h2>
              <button
                onClick={() => setShowAddJob(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.job_title}
                    onChange={(e) =>
                      setNewJob({ ...newJob, job_title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <select
                    required
                    value={newJob.company_id}
                    onChange={(e) =>
                      setNewJob({ ...newJob, company_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option
                        key={company.company_id}
                        value={company.company_id}
                      >
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  rows={4}
                  value={newJob.description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Type
                  </label>
                  <select
                    value={newJob.job_type}
                    onChange={(e) =>
                      setNewJob({ ...newJob, job_type: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Salary
                </label>
                <input
                  type="number"
                  value={newJob.salary}
                  onChange={(e) =>
                    setNewJob({ ...newJob, salary: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 800000"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddJob}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Add Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {selectedJob.job_title}
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(
                    selectedJob.job_type
                  )}`}
                >
                  {selectedJob.job_type}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  {getCompanyName(selectedJob.company_id)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-300">
                      {selectedJob.location}
                    </span>
                  </div>

                  {selectedJob.salary && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">
                        {formatSalary(selectedJob.salary)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <span className="text-gray-300">
                      Posted: {formatDate(selectedJob.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedJob.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Job Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {selectedJob.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Requirements
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
