import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  LogOut,
  User,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CoordinatorDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyUpdates, setCompanyUpdates] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updates");
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const navigate = useNavigate();

  const [updateForm, setUpdateForm] = useState({
    company_name: "",
    job_title: "",
    job_description: "",
    requirements: "",
    package_details: "",
    eligibility_criteria: "",
    application_deadline: "",
    interview_schedule: "",
    location: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "coordinator") {
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch profile
      const profileRes = await fetch("http://localhost:3001/api/auth/profile", {
        headers,
      });
      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      // Fetch company updates
      const updatesRes = await fetch(
        "http://localhost:3001/api/company-updates",
        { headers }
      );
      const updatesData = await updatesRes.json();
      setCompanyUpdates(updatesData.data);

      // Fetch students
      const studentsRes = await fetch("http://localhost:3001/api/students", {
        headers,
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData.data);

      // Fetch stats
      const statsRes = await fetch("http://localhost:3001/api/results/stats", {
        headers,
      });
      const statsData = await statsRes.json();
      setStats(statsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAddUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/company-updates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateForm),
        }
      );

      if (response.ok) {
        await fetchData();
        setShowAddUpdate(false);
        resetForm();
        alert("Company update created successfully!");
      } else {
        const error = await response.json();
        alert("Failed to create update: " + error.error);
      }
    } catch (error) {
      console.error("Error creating update:", error);
      alert("Failed to create update");
    }
  };

  const handleUpdateStatus = async (updateId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/company-updates/${updateId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        await fetchData();
        alert("Status updated successfully!");
      } else {
        const error = await response.json();
        alert("Failed to update status: " + error.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const resetForm = () => {
    setUpdateForm({
      company_name: "",
      job_title: "",
      job_description: "",
      requirements: "",
      package_details: "",
      eligibility_criteria: "",
      application_deadline: "",
      interview_schedule: "",
      location: "",
    });
    setEditingUpdate(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "approved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "pending_approval":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Lakshya - Coordinator Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                {profile?.department} Department Coordinator
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Coordinator</p>
              <p className="font-semibold">{profile?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Department Students</p>
                <p className="text-2xl font-bold text-white">
                  {stats.departmentStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">My Updates</p>
                <p className="text-2xl font-bold text-white">
                  {stats.myUpdates || 0}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Results Published</p>
                <p className="text-2xl font-bold text-white">
                  {stats.myResults || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
          <div className="flex space-x-8 px-6">
            {[
              { id: "updates", label: "Company Updates", icon: Building },
              { id: "students", label: "Students", icon: Users },
              { id: "results", label: "Results", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Company Updates Tab */}
        {activeTab === "updates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Company Updates</h2>
              <button
                onClick={() => setShowAddUpdate(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Update</span>
              </button>
            </div>

            {companyUpdates.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <p className="text-xl text-gray-400">No company updates yet</p>
                <p className="text-gray-500">
                  Create your first company update
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyUpdates.map((update) => (
                  <div
                    key={update.update_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {update.job_title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {update.company_name}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          update.status
                        )}`}
                      >
                        {update.status.replace("_", " ")}
                      </span>
                    </div>

                    {update.job_description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {update.job_description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {update.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{update.location}</span>
                        </div>
                      )}

                      {update.package_details && (
                        <div className="text-sm text-green-400 font-medium">
                          {update.package_details}
                        </div>
                      )}

                      {update.application_deadline && (
                        <div className="text-sm text-yellow-400">
                          Deadline:{" "}
                          {new Date(
                            update.application_deadline
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-2" />
                        View
                      </button>
                      {update.status === "draft" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              update.update_id,
                              "pending_approval"
                            )
                          }
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Department Students
            </h2>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <p className="text-xl text-gray-400">No students found</p>
                <p className="text-gray-500">
                  Students will appear here once they register
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <div
                    key={student.student_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {student.student_id}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{student.branch}</span>
                          <span>•</span>
                          <span>{student.graduation_year}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          student.placement_status === "Placed"
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : student.placement_status === "Interviewing"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                        }`}
                      >
                        {student.placement_status || "Available"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span>Email: {student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-2">
                          <span>Phone: {student.phone}</span>
                        </div>
                      )}
                      {student.cgpa && (
                        <div className="flex items-center space-x-2">
                          <span>CGPA: {student.cgpa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Placement Results</h2>
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <p className="text-xl text-gray-400">
                Results management coming soon
              </p>
              <p className="text-gray-500">
                You'll be able to publish results here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Update Modal */}
      {showAddUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Add Company Update
              </h2>
              <button
                onClick={() => {
                  setShowAddUpdate(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
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
                    value={updateForm.company_name}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        company_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., TechCorp Solutions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={updateForm.job_title}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        job_title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  rows={4}
                  value={updateForm.job_description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      job_description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe the job role and responsibilities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  rows={3}
                  value={updateForm.requirements}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      requirements: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="List the requirements and qualifications..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Package Details
                  </label>
                  <input
                    type="text"
                    value={updateForm.package_details}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        package_details: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 8-12 LPA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={updateForm.location}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Bangalore, India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={updateForm.application_deadline}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        application_deadline: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interview Schedule
                  </label>
                  <input
                    type="datetime-local"
                    value={updateForm.interview_schedule}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        interview_schedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Eligibility Criteria
                </label>
                <textarea
                  rows={3}
                  value={updateForm.eligibility_criteria}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      eligibility_criteria: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="List the eligibility criteria..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddUpdate(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUpdate}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                >
                  Create Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
