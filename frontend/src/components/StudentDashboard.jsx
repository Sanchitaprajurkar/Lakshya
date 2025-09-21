import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  FileText,
  Building,
  Calendar,
  Upload,
  User,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyUpdates, setCompanyUpdates] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("opportunities");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "student") {
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

      // Fetch my applications
      const applicationsRes = await fetch("http://localhost:3001/api/results", {
        headers,
      });
      const applicationsData = await applicationsRes.json();
      setMyApplications(applicationsData.data);

      // Fetch my results
      setMyResults(applicationsData.data.filter((app) => app.result_status));
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "selected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "shortlisted":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "selected":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "shortlisted":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
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
            <GraduationCap className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Lakshya - Student Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                Welcome back, {profile?.full_name || user?.username}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Student ID</p>
              <p className="font-semibold">{profile?.student_id}</p>
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

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-8 px-6">
          {[
            { id: "opportunities", label: "Job Opportunities", icon: Building },
            { id: "applications", label: "My Applications", icon: FileText },
            { id: "results", label: "Results", icon: CheckCircle },
            { id: "profile", label: "Profile", icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Job Opportunities Tab */}
        {activeTab === "opportunities" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Available Opportunities
              </h2>
              <p className="text-gray-400">
                {companyUpdates.length} opportunities available
              </p>
            </div>

            {companyUpdates.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <p className="text-xl text-gray-400">
                  No opportunities available
                </p>
                <p className="text-gray-500">
                  Check back later for new job postings
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyUpdates.map((update) => (
                  <div
                    key={update.update_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-200"
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
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/50">
                        Published
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
                          <Calendar className="h-4 w-4" />
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

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Applications</h2>

            {myApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <p className="text-xl text-gray-400">No applications yet</p>
                <p className="text-gray-500">
                  Apply to job opportunities to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <div
                    key={app.result_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {app.job_title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Building className="h-4 w-4" />
                          <span>{app.company_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(app.result_status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            app.result_status
                          )}`}
                        >
                          {app.result_status || "Applied"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      {app.interview_notes && (
                        <span>Notes: {app.interview_notes}</span>
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
            <h2 className="text-2xl font-bold text-white">My Results</h2>

            {myResults.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <p className="text-xl text-gray-400">No results yet</p>
                <p className="text-gray-500">
                  Results will appear here once interviews are completed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myResults.map((result) => (
                  <div
                    key={result.result_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {result.job_title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Building className="h-4 w-4" />
                          <span>{result.company_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.result_status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            result.result_status
                          )}`}
                        >
                          {result.result_status}
                        </span>
                      </div>
                    </div>

                    {result.final_package && (
                      <div className="text-green-400 font-semibold mb-2">
                        Package: ₹{result.final_package.toLocaleString()}
                      </div>
                    )}

                    {result.interview_notes && (
                      <div className="text-gray-300 text-sm">
                        <strong>Notes:</strong> {result.interview_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name
                  </label>
                  <p className="text-white">
                    {profile?.full_name || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Student ID
                  </label>
                  <p className="text-white">{profile?.student_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Branch
                  </label>
                  <p className="text-white">{profile?.branch}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    CGPA
                  </label>
                  <p className="text-white">
                    {profile?.cgpa || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Graduation Year
                  </label>
                  <p className="text-white">{profile?.graduation_year}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone
                  </label>
                  <p className="text-white">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Placement Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      profile?.placement_status || "Available"
                    )}`}
                  >
                    {profile?.placement_status || "Available"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Resume
                </label>
                <div className="flex items-center space-x-4">
                  {profile?.resume_path ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <FileText className="h-5 w-5" />
                      <span>Resume uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <FileText className="h-5 w-5" />
                      <span>No resume uploaded</span>
                    </div>
                  )}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Resume</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
