import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Building,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Target,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart3,
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  applicationsAPI,
  studentsAPI,
  jobsAPI,
  companiesAPI,
  formatDate,
  formatSalary,
} from "../utils/api";

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    placedStudents: 0,
    averageSalary: 0,
    placementRate: 0,
    activeJobs: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [branchStats, setBranchStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        studentsRes,
        jobsRes,
        companiesRes,
        applicationsRes,
        placementStatsRes,
      ] = await Promise.all([
        studentsAPI.getAll(),
        jobsAPI.getAll(),
        companiesAPI.getAll(),
        applicationsAPI.getAll(),
        applicationsAPI.getPlacementStats(),
      ]);

      const students = studentsRes.data || [];
      const jobs = jobsRes.data || [];
      const companies = companiesRes.data || [];
      const applications = applicationsRes.data || [];
      const placementStats = placementStatsRes.data || {};

      // Calculate stats
      const placedStudents = applications.filter(
        (app) => app.status === "Selected"
      ).length;
      const activeJobs = jobs.filter((job) => job.status === "Active").length;
      const totalApplications = applications.length;

      setStats({
        totalStudents: students.length,
        totalJobs: jobs.length,
        totalCompanies: companies.length,
        totalApplications,
        placedStudents,
        averageSalary: placementStats.average_salary || 0,
        placementRate: placementStats.placement_percentage || 0,
        activeJobs,
      });

      // Set recent applications
      const recentApps = applications
        .sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date))
        .slice(0, 5)
        .map((app) => {
          const student = students.find((s) => s.student_id === app.student_id);
          const job = jobs.find((j) => j.job_id === app.job_id);
          const company = companies.find(
            (c) => c.company_id === job?.company_id
          );

          return {
            id: app.app_id,
            studentName: student?.name || "Unknown",
            jobTitle: job?.job_title || "Unknown",
            company: company?.name || "Unknown",
            status: app.status,
            appliedDate: app.applied_date,
            salary: job?.salary || 0,
          };
        });

      setRecentApplications(recentApps);

      // Calculate top companies
      const companyJobCounts = {};
      jobs.forEach((job) => {
        const company = companies.find((c) => c.company_id === job.company_id);
        if (company) {
          if (!companyJobCounts[company.company_id]) {
            companyJobCounts[company.company_id] = {
              name: company.name,
              jobsPosted: 0,
              applicants: 0,
              hired: 0,
              avgSalary: 0,
            };
          }
          companyJobCounts[company.company_id].jobsPosted++;
          companyJobCounts[company.company_id].avgSalary += job.salary || 0;
        }
      });

      // Count applicants and hired for each company
      applications.forEach((app) => {
        const job = jobs.find((j) => j.job_id === app.job_id);
        if (job && companyJobCounts[job.company_id]) {
          companyJobCounts[job.company_id].applicants++;
          if (app.status === "Selected") {
            companyJobCounts[job.company_id].hired++;
          }
        }
      });

      const topCompaniesData = Object.values(companyJobCounts)
        .map((company) => ({
          ...company,
          avgSalary: company.avgSalary / company.jobsPosted,
        }))
        .sort((a, b) => b.jobsPosted - a.jobsPosted)
        .slice(0, 5);

      setTopCompanies(topCompaniesData);

      // Calculate branch stats
      const branchData = {};
      students.forEach((student) => {
        if (!branchData[student.branch]) {
          branchData[student.branch] = {
            branch: student.branch,
            students: 0,
            placed: 0,
            avgSalary: 0,
          };
        }
        branchData[student.branch].students++;
      });

      applications.forEach((app) => {
        if (app.status === "Selected") {
          const student = students.find((s) => s.student_id === app.student_id);
          if (student && branchData[student.branch]) {
            branchData[student.branch].placed++;
          }
        }
      });

      const branchStatsData = Object.values(branchData).map((branch) => ({
        ...branch,
        placementRate: (branch.placed / branch.students) * 100,
        avgSalary: 0, // Would need to calculate from job salaries
      }));

      setBranchStats(branchStatsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Applied: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "Under Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      "Interview Scheduled":
        "bg-purple-500/20 text-purple-400 border-purple-500/50",
      Selected: "bg-green-500/20 text-green-400 border-green-500/50",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return (
      statusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50"
    );
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    trendValue,
    color,
  }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 ${
              trend === "up" ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
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
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Placement Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Welcome back! Here's your placement overview
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Today</p>
                <p className="text-lg font-semibold text-white">
                  {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate("students")}
            className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <Users className="h-6 w-6 text-blue-500" />
            <div className="text-left">
              <p className="text-white font-medium">Students</p>
              <p className="text-gray-400 text-sm">Manage students</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate("jobs")}
            className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-green-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
          >
            <Briefcase className="h-6 w-6 text-green-500" />
            <div className="text-left">
              <p className="text-white font-medium">Jobs</p>
              <p className="text-gray-400 text-sm">Manage job postings</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate("companies")}
            className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
          >
            <Building className="h-6 w-6 text-orange-500" />
            <div className="text-left">
              <p className="text-white font-medium">Companies</p>
              <p className="text-gray-400 text-sm">Manage companies</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => onNavigate("applications")}
            className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <FileText className="h-6 w-6 text-purple-500" />
            <div className="text-left">
              <p className="text-white font-medium">Applications</p>
              <p className="text-gray-400 text-sm">Track applications</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            subtitle="Active registrations"
            trend="up"
            trendValue="12.5"
            color="bg-gradient-to-r from-blue-600 to-blue-700"
          />
          <StatCard
            icon={Briefcase}
            title="Active Jobs"
            value={stats.activeJobs}
            subtitle={`${stats.totalJobs} total posted`}
            trend="up"
            trendValue="8.2"
            color="bg-gradient-to-r from-green-600 to-green-700"
          />
          <StatCard
            icon={Building}
            title="Partner Companies"
            value={stats.totalCompanies}
            subtitle="Hiring partners"
            trend="up"
            trendValue="15.3"
            color="bg-gradient-to-r from-purple-600 to-purple-700"
          />
          <StatCard
            icon={Target}
            title="Placement Rate"
            value={`${stats.placementRate}%`}
            subtitle={`${stats.placedStudents} students placed`}
            trend="up"
            trendValue="5.7"
            color="bg-gradient-to-r from-pink-600 to-pink-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Recent Applications
                </h2>
                <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <span className="text-sm">View All</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentApplications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {application.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {application.studentName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {application.jobTitle} at {application.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-300">
                          {formatSalary(application.salary)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.appliedDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Applications</span>
                  <span className="font-semibold text-white">
                    {stats.totalApplications.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Salary</span>
                  <span className="font-semibold text-green-400">
                    {formatSalary(stats.averageSalary)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="font-semibold text-blue-400">
                    {stats.placementRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Openings</span>
                  <span className="font-semibold text-purple-400">
                    {stats.activeJobs}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Award className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">New Placements</p>
                    <p className="font-semibold text-white">47</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Applications</p>
                    <p className="font-semibold text-white">189</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Interviews</p>
                    <p className="font-semibold text-white">78</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Companies */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span>Top Hiring Companies</span>
                </h2>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  <BarChart3 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-sm text-gray-400">
                          {company.jobsPosted} jobs • {company.applicants}{" "}
                          applicants
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">
                        {company.hired} hired
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatSalary(company.avgSalary)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch-wise Stats */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  <span>Branch-wise Placement</span>
                </h2>
                <button className="text-purple-400 hover:text-purple-300 transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {branchStats.map((branch, index) => (
                  <div key={branch.branch} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {branch.branch}
                      </span>
                      <span className="text-sm text-gray-400">
                        {branch.placementRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>
                        {branch.placed}/{branch.students} placed
                      </span>
                      <span>{formatSalary(branch.avgSalary)} avg</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${branch.placementRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">This Week</p>
                <p className="text-xl font-bold text-white">23</p>
                <p className="text-xs text-green-400">New Placements</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Interviews</p>
                <p className="text-xl font-bold text-white">156</p>
                <p className="text-xs text-blue-400">This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-xl font-bold text-white">89</p>
                <p className="text-xs text-yellow-400">Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Top Performer</p>
                <p className="text-lg font-bold text-white">CSE</p>
                <p className="text-xs text-purple-400">86% Placement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
