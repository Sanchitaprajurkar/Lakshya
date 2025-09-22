import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Users,
  BookOpen,
  Star,
} from "lucide-react";
import {
  studentsAPI,
  validateEmail,
  validatePhone,
  formatDate,
  getCGPAColor,
} from "../utils/api";

// Utility functions for UI styling
const getCGPAColorUI = (cgpa) => {
  if (cgpa >= 9.0) return "text-green-400 bg-green-500/20 border-green-500/50";
  if (cgpa >= 8.0) return "text-blue-400 bg-blue-500/20 border-blue-500/50";
  if (cgpa >= 7.0)
    return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
  if (cgpa >= 6.0)
    return "text-orange-400 bg-orange-500/20 border-orange-500/50";
  return "text-red-400 bg-red-500/20 border-red-500/50";
};

const StudentForm = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    minCGPA: "",
    maxCGPA: "",
    status: "",
  });

  const [studentForm, setStudentForm] = useState({
    student_id: "",
    name: "",
    email: "",
    phone: "",
    branch: "",
    cgpa: "",
    graduation_year: "",
  });

  const branches = [
    "CSE",
    "ECE",
    "ME",
    "CE",
    "EE",
    "IT",
    "AI/ML",
    "Data Science",
  ];
  const years = ["1", "2", "3", "4"];
  const placementStatuses = [
    "Available",
    "Interviewing",
    "Placed",
    "Not Interested",
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting to add student with data:", studentForm);

      if (!validateForm()) {
        console.log("Form validation failed");
        return;
      }

      console.log("Form validation passed, calling API...");
      const result = await studentsAPI.create(studentForm);
      console.log("API call successful:", result);

      await fetchStudents();
      resetForm();
      setShowAddStudent(false);
      alert("Student added successfully!");
    } catch (error) {
      console.error("Failed to create student:", error);
      alert("Failed to add student: " + error.message);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) return;

      await studentsAPI.update(editingStudent.student_id, studentForm);
      await fetchStudents();
      resetForm();
      setEditingStudent(null);
      alert("Student updated successfully!");
    } catch (error) {
      console.error("Failed to update student:", error);
      alert("Failed to update student: " + error.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await studentsAPI.delete(studentId);
      await fetchStudents();
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student: " + error.message);
    }
  };

  const validateForm = () => {
    if (!studentForm.name.trim()) {
      alert("Name is required");
      return false;
    }
    if (!studentForm.email.trim() || !validateEmail(studentForm.email)) {
      alert("Valid email is required");
      return false;
    }
    if (!studentForm.phone.trim() || !validatePhone(studentForm.phone)) {
      alert("Valid phone number is required");
      return false;
    }
    if (!studentForm.student_id.trim()) {
      alert("Student ID is required");
      return false;
    }
    if (!studentForm.branch) {
      alert("Branch is required");
      return false;
    }
    if (!studentForm.graduation_year) {
      alert("Graduation year is required");
      return false;
    }
    if (
      studentForm.cgpa &&
      (isNaN(studentForm.cgpa) || studentForm.cgpa < 0 || studentForm.cgpa > 10)
    ) {
      alert("CGPA must be between 0 and 10");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setStudentForm({
      student_id: "",
      name: "",
      email: "",
      phone: "",
      branch: "",
      cgpa: "",
      graduation_year: "",
    });
  };

  const handleEdit = (student) => {
    setStudentForm({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      branch: student.branch,
      cgpa: student.cgpa ? student.cgpa.toString() : "",
      graduation_year: student.graduation_year
        ? student.graduation_year.toString()
        : "",
    });
    setEditingStudent(student);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Available: "bg-green-500/20 text-green-400 border-green-500/50",
      Interviewing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      Placed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "Not Interested": "bg-gray-500/20 text-gray-400 border-gray-500/50",
    };
    return (
      statusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50"
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !filters.branch || student.branch === filters.branch;
    const matchesYear =
      !filters.year || student.graduation_year.toString() === filters.year;
    const matchesStatus =
      !filters.status || student.placement_status === filters.status;
    const matchesCGPA =
      (!filters.minCGPA || student.cgpa >= parseFloat(filters.minCGPA)) &&
      (!filters.maxCGPA || student.cgpa <= parseFloat(filters.maxCGPA));

    return (
      matchesSearch &&
      matchesBranch &&
      matchesYear &&
      matchesStatus &&
      matchesCGPA
    );
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
            <Users className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Student Management
            </h1>
          </div>
          <button
            onClick={() => setShowAddStudent(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
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
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select
                value={filters.branch}
                onChange={(e) =>
                  setFilters({ ...filters, branch: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Status</option>
                {placementStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min CGPA"
                value={filters.minCGPA}
                onChange={(e) =>
                  setFilters({ ...filters, minCGPA: e.target.value })
                }
                min="0"
                max="10"
                step="0.1"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />

              <input
                type="number"
                placeholder="Max CGPA"
                value={filters.maxCGPA}
                onChange={(e) =>
                  setFilters({ ...filters, maxCGPA: e.target.value })
                }
                min="0"
                max="10"
                step="0.1"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Students Grid */}
      <div className="px-6 pb-6">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No students found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {student.student_id}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-300">
                        {student.branch} - {student.graduation_year}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.student_id)}
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
                      {student.email}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{student.phone}</span>
                  </div>

                  {student.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 truncate">
                        {student.address}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getCGPAColorUI(
                        student.cgpa
                      )}`}
                    >
                      CGPA: {student.cgpa}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Added {formatDate(student.created_at)}
                  </span>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {(showAddStudent || editingStudent) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={() => {
                  setShowAddStudent(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.student_id}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        student_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., CS21001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="student@college.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={studentForm.phone}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Branch *
                  </label>
                  <select
                    required
                    value={studentForm.branch}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="2020"
                    max="2030"
                    value={studentForm.graduation_year}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        graduation_year: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={studentForm.cgpa}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, cgpa: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 8.5"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddStudent(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingStudent ? "Update" : "Add"} Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-gray-400 mb-2">
                    {selectedStudent.student_id}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getCGPAColorUI(
                        selectedStudent.cgpa
                      )}`}
                    >
                      CGPA: {selectedStudent.cgpa}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Personal Information
                  </h4>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{selectedStudent.phone}</p>
                    </div>
                  </div>

                  {selectedStudent.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="text-white">{selectedStudent.address}</p>
                      </div>
                    </div>
                  )}

                  {selectedStudent.date_of_birth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-400">Date of Birth</p>
                        <p className="text-white">
                          {formatDate(selectedStudent.date_of_birth)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Academic Information
                  </h4>

                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-400">Branch</p>
                      <p className="text-white">{selectedStudent.branch}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-400">Graduation Year</p>
                      <p className="text-white">
                        {selectedStudent.graduation_year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">CGPA</p>
                      <p className="text-white">{selectedStudent.cgpa} / 10</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Student</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForm;
