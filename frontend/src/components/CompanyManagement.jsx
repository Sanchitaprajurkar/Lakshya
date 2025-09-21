import React, { useState, useEffect } from "react";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  Briefcase,
  Users,
} from "lucide-react";
import { companiesAPI, jobsAPI, formatDate } from "../utils/api";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    industry: "",
    location: "",
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    website: "",
    industry: "",
    location: "",
  });

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        companiesAPI.getAll(),
        jobsAPI.getAll(),
      ]);

      setCompanies(companiesRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      if (
        !companyForm.name ||
        !companyForm.email ||
        !companyForm.industry ||
        !companyForm.location
      ) {
        alert("Please fill in all required fields");
        return;
      }

      await companiesAPI.create(companyForm);
      await fetchData();
      resetForm();
      setShowAddCompany(false);
      alert("Company added successfully!");
    } catch (error) {
      console.error("Failed to create company:", error);
      alert("Failed to add company: " + error.message);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      if (
        !companyForm.name ||
        !companyForm.email ||
        !companyForm.industry ||
        !companyForm.location
      ) {
        alert("Please fill in all required fields");
        return;
      }

      await companiesAPI.update(editingCompany.company_id, companyForm);
      await fetchData();
      resetForm();
      setEditingCompany(null);
      alert("Company updated successfully!");
    } catch (error) {
      console.error("Failed to update company:", error);
      alert("Failed to update company: " + error.message);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      await companiesAPI.delete(companyId);
      await fetchData();
      alert("Company deleted successfully!");
    } catch (error) {
      console.error("Failed to delete company:", error);
      alert("Failed to delete company: " + error.message);
    }
  };

  const resetForm = () => {
    setCompanyForm({
      name: "",
      email: "",
      website: "",
      industry: "",
      location: "",
    });
  };

  const handleEdit = (company) => {
    setCompanyForm({
      name: company.name,
      email: company.email,
      website: company.website || "",
      industry: company.industry,
      location: company.location,
    });
    setEditingCompany(company);
  };

  const getJobsForCompany = (companyId) => {
    return jobs.filter((job) => job.company_id === companyId);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry =
      !filters.industry || company.industry === filters.industry;
    const matchesLocation =
      !filters.location ||
      company.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesIndustry && matchesLocation;
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
            <Building className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Company Management
            </h1>
          </div>
          <button
            onClick={() => setShowAddCompany(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
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
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filters.industry}
                onChange={(e) =>
                  setFilters({ ...filters, industry: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
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
            </div>
          </div>
        )}
      </div>

      {/* Companies Grid */}
      <div className="px-6 pb-6">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No companies found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => {
              const companyJobs = getJobsForCompany(company.company_id);
              return (
                <div
                  key={company.company_id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs border border-orange-500/50">
                          {company.industry}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.company_id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 truncate">
                        {company.email}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{company.location}</span>
                    </div>

                    {company.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{companyJobs.length} jobs</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Added {formatDate(company.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Company Modal */}
      {(showAddCompany || editingCompany) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h2>
              <button
                onClick={() => {
                  setShowAddCompany(false);
                  setEditingCompany(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, website: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry *
                  </label>
                  <select
                    value={companyForm.industry}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        industry: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddCompany(false);
                    setEditingCompany(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingCompany ? handleUpdateCompany : handleAddCompany
                  }
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingCompany ? "Update" : "Add"} Company</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Company Details</h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCompany.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedCompany.name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/50">
                      {selectedCompany.industry}
                    </span>
                    <span className="text-gray-400">
                      {selectedCompany.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Contact Information
                  </h4>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedCompany.email}</p>
                    </div>
                  </div>

                  {selectedCompany.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-400">Website</p>
                        <a
                          href={selectedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {selectedCompany.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">{selectedCompany.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Statistics
                  </h4>

                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Jobs</p>
                      <p className="text-white">
                        {getJobsForCompany(selectedCompany.company_id).length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-400">Joined</p>
                      <p className="text-white">
                        {formatDate(selectedCompany.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {getJobsForCompany(selectedCompany.company_id).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Active Jobs
                  </h4>
                  <div className="space-y-2">
                    {getJobsForCompany(selectedCompany.company_id).map(
                      (job) => (
                        <div
                          key={job.job_id}
                          className="bg-gray-700 p-3 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {job.job_title}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {job.location}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/50">
                            {job.job_type}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedCompany);
                    setSelectedCompany(null);
                  }}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Company</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
