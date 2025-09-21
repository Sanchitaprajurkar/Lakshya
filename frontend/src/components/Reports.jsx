import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Award,
  Building,
} from "lucide-react";
import {
  applicationsAPI,
  studentsAPI,
  jobsAPI,
  companiesAPI,
  formatDate,
} from "../utils/api";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [placementStats, setPlacementStats] = useState(null);
  const [jobStats, setJobStats] = useState([]);
  const [studentCategories, setStudentCategories] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    branch: "",
    company: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        placementStatsRes,
        jobStatsRes,
        studentCategoriesRes,
        applicationsRes,
        companiesRes,
        studentsRes,
        jobsRes,
      ] = await Promise.all([
        applicationsAPI.getPlacementStats(),
        jobsAPI.getStats(),
        studentsAPI.getCategories(),
        applicationsAPI.getAll(),
        companiesAPI.getAll(),
        studentsAPI.getAll(),
        jobsAPI.getAll(),
      ]);

      setPlacementStats(placementStatsRes.data);
      setJobStats(jobStatsRes.data || []);
      setStudentCategories(studentCategoriesRes.data || []);
      setApplications(applicationsRes.data || []);
      setCompanies(companiesRes.data || []);
      setStudents(studentsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const statusCounts = {
      Applied: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Selected: 0,
      Rejected: 0,
    };

    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    return statusCounts;
  };

  const getBranchStats = () => {
    const branchStats = {};
    students.forEach((student) => {
      branchStats[student.branch] = (branchStats[student.branch] || 0) + 1;
    });
    return branchStats;
  };

  const getCompanyStats = () => {
    const companyStats = {};
    jobs.forEach((job) => {
      const companyName =
        companies.find((c) => c.company_id === job.company_id)?.name ||
        "Unknown";
      companyStats[companyName] = (companyStats[companyName] || 0) + 1;
    });
    return companyStats;
  };

  const getCGPAStats = () => {
    const cgpaStats = {
      "9.0+": 0,
      "8.0-8.9": 0,
      "7.0-7.9": 0,
      "6.0-6.9": 0,
      "Below 6.0": 0,
    };

    students.forEach((student) => {
      const cgpa = parseFloat(student.cgpa);
      if (cgpa >= 9.0) cgpaStats["9.0+"]++;
      else if (cgpa >= 8.0) cgpaStats["8.0-8.9"]++;
      else if (cgpa >= 7.0) cgpaStats["7.0-7.9"]++;
      else if (cgpa >= 6.0) cgpaStats["6.0-6.9"]++;
      else cgpaStats["Below 6.0"]++;
    });

    return cgpaStats;
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const branchStats = getBranchStats();
  const companyStats = getCompanyStats();
  const cgpaStats = getCGPAStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => exportToCSV(applications, "applications.csv")}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">
                  {students.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-white">
                  {applications.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Placement Rate</p>
                <p className="text-2xl font-bold text-white">
                  {placementStats?.placement_percentage || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Placement Statistics */}
        {placementStats && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Placement Statistics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {placementStats.placed_students || 0}
                </p>
                <p className="text-gray-400">Students Placed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {placementStats.total_students || 0}
                </p>
                <p className="text-gray-400">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  ₹{placementStats.average_salary || 0}
                </p>
                <p className="text-gray-400">Average Salary</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <span>Application Status Distribution</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-300">{status}</span>
                  </div>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Students by Branch</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(branchStats).map(([branch, count]) => (
                <div key={branch} className="flex items-center justify-between">
                  <span className="text-gray-300">{branch}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CGPA Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span>CGPA Distribution</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(cgpaStats).map(([range, count]) => (
              <div key={range} className="text-center">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-gray-400 text-sm">{range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Building className="h-5 w-5 text-orange-500" />
            <span>Top Companies by Job Postings</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(companyStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([company, count]) => (
                <div
                  key={company}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300">{company}</span>
                  <span className="text-white font-semibold">{count} jobs</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-500" />
            <span>Recent Applications</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Student</th>
                  <th className="text-left py-2 text-gray-400">Job</th>
                  <th className="text-left py-2 text-gray-400">Company</th>
                  <th className="text-left py-2 text-gray-400">Status</th>
                  <th className="text-left py-2 text-gray-400">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => {
                  const student = students.find(
                    (s) => s.student_id === app.student_id
                  );
                  const job = jobs.find((j) => j.job_id === app.job_id);
                  const company = companies.find(
                    (c) => c.company_id === job?.company_id
                  );

                  return (
                    <tr key={app.app_id} className="border-b border-gray-700">
                      <td className="py-2 text-white">
                        {student?.name || "Unknown"}
                      </td>
                      <td className="py-2 text-gray-300">
                        {job?.job_title || "Unknown"}
                      </td>
                      <td className="py-2 text-gray-300">
                        {company?.name || "Unknown"}
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">
                        {formatDate(app.applied_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
