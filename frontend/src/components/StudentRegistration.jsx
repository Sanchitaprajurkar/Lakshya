import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Upload,
  ArrowLeft,
} from "lucide-react";

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    fullName: "",
    phone: "",
    branch: "",
    cgpa: "",
    graduationYear: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  const branches = [
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      setError("Please upload a PDF file only");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add user data
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", "student");
      formDataToSend.append("department", formData.branch);

      // Add student data
      formDataToSend.append(
        "studentData",
        JSON.stringify({
          student_id: formData.studentId,
          full_name: formData.fullName,
          phone: formData.phone,
          branch: formData.branch,
          cgpa: parseFloat(formData.cgpa) || null,
          graduation_year: parseInt(formData.graduationYear),
        })
      );

      // Add resume file if selected
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }

      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login to continue.");
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Lakshya</h1>
          <p className="text-blue-200 text-lg">KKWIEER Student Registration</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="student@kkwieer.edu"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS2021001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Branch *
                </label>
                <select
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch} className="bg-gray-800">
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  name="cgpa"
                  min="0"
                  max="10"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  required
                  min="2020"
                  max="2030"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2025"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Resume (PDF)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex items-center justify-center w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {resumeFile ? resumeFile.name : "Upload Resume (PDF)"}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center">
              <p className="text-white/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            © 2024 KKWIEER - Lakshya Placement Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
