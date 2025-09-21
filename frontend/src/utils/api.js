// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Students API
export const studentsAPI = {
  getAll: () => apiRequest("/students"),

  getById: (id) => apiRequest(`/students/${id}`),

  create: (studentData) =>
    apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(studentData),
    }),

  update: (id, studentData) =>
    apiRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(studentData),
    }),

  delete: (id) =>
    apiRequest(`/students/${id}`, {
      method: "DELETE",
    }),

  getCategories: () => apiRequest("/students/categories"),

  search: (query) =>
    apiRequest(`/students/search?q=${encodeURIComponent(query)}`),
};

// Companies API
export const companiesAPI = {
  getAll: () => apiRequest("/companies"),

  getById: (id) => apiRequest(`/companies/${id}`),

  create: (companyData) =>
    apiRequest("/companies", {
      method: "POST",
      body: JSON.stringify(companyData),
    }),

  update: (id, companyData) =>
    apiRequest(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(companyData),
    }),

  delete: (id) =>
    apiRequest(`/companies/${id}`, {
      method: "DELETE",
    }),

  search: (query) =>
    apiRequest(`/companies/search?q=${encodeURIComponent(query)}`),
};

// Jobs API
export const jobsAPI = {
  getAll: () => apiRequest("/jobs"),

  getById: (id) => apiRequest(`/jobs/${id}`),

  create: (jobData) =>
    apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    }),

  update: (id, jobData) =>
    apiRequest(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    }),

  delete: (id) =>
    apiRequest(`/jobs/${id}`, {
      method: "DELETE",
    }),

  getByCompany: (companyId) => apiRequest(`/jobs/company/${companyId}`),

  getStats: () => apiRequest("/jobs/stats"),

  search: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return apiRequest(`/jobs/search?${params.toString()}`);
  },
};

// Applications API
export const applicationsAPI = {
  getAll: () => apiRequest("/applications"),

  getById: (id) => apiRequest(`/applications/${id}`),

  create: (applicationData) =>
    apiRequest("/applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    }),

  update: (id, applicationData) =>
    apiRequest(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(applicationData),
    }),

  delete: (id) =>
    apiRequest(`/applications/${id}`, {
      method: "DELETE",
    }),

  getByStudent: (studentId) => apiRequest(`/applications/student/${studentId}`),

  getByJob: (jobId) => apiRequest(`/applications/job/${jobId}`),

  getByCompany: (companyId) => apiRequest(`/applications/company/${companyId}`),

  updateStatus: (id, status) =>
    apiRequest(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getPlacementStats: () => apiRequest("/applications/placement-stats"),

  getReports: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return apiRequest(`/applications/reports?${params.toString()}`);
  },
};

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatSalary = (salary) => {
  if (!salary || salary === 0) return "Not disclosed";

  if (salary >= 10000000) {
    // 1 crore or more
    return `₹${(salary / 10000000).toFixed(1)} Cr`;
  } else if (salary >= 100000) {
    // 1 lakh or more
    return `₹${(salary / 100000).toFixed(1)} LPA`;
  } else {
    return `₹${salary.toLocaleString("en-IN")}`;
  }
};

export const getStatusColor = (status) => {
  const statusColors = {
    Applied: "bg-blue-100 text-blue-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    "Interview Scheduled": "bg-purple-100 text-purple-800",
    Selected: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Withdrawn: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const getCGPAColor = (cgpa) => {
  if (cgpa >= 9.0) return "text-green-700 bg-green-100";
  if (cgpa >= 8.0) return "text-blue-700 bg-blue-100";
  if (cgpa >= 7.0) return "text-yellow-700 bg-yellow-100";
  if (cgpa >= 6.0) return "text-orange-700 bg-orange-100";
  return "text-red-700 bg-red-100";
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
