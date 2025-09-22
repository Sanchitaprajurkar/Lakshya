import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import CoordinatorDashboard from "./components/CoordinatorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import StudentRegistration from "./components/StudentRegistration";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={`/${user.role}-dashboard`} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={`/${user.role}-dashboard`} replace />
            ) : (
              <StudentRegistration />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/student-dashboard"
          element={
            user && user.role === "student" ? (
              <StudentDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/coordinator-dashboard"
          element={
            user && user.role === "coordinator" ? (
              <CoordinatorDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}-dashboard`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
