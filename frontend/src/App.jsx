import React, { useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Building,
  Menu,
  X,
  User,
  Settings,
  BarChart3,
  Search,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import JobList from "./components/JobList";
import StudentForm from "./components/StudentForm";
import ApplicationManagement from "./components/ApplicationManagement";
import CompanyManagement from "./components/CompanyManagement";
import ApplicationTracker from "./components/ApplicationTracker";
import Reports from "./components/Reports";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "companies", label: "Companies", icon: Building },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "tracker", label: "Track Applications", icon: Search },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "students":
        return <StudentForm />;
      case "companies":
        return <CompanyManagement />;
      case "jobs":
        return <JobList />;
      case "applications":
        return <ApplicationManagement />;
      case "tracker":
        return <ApplicationTracker />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">PlacementPro</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@college.edu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {navigationItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
