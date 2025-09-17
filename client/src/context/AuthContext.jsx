import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAdminView, setActiveAdminView] = useState("home");

  const baseurl = "https://csi-attendance-web.onrender.com";

  // All API Routes organized by category
  const routes = {
    // Authentication Routes
    auth: {
      organizationRegister: `${baseurl}/auth2/organization-register`,
      registerUser: `${baseurl}/auth2/register-user`,
      login: `${baseurl}/auth2/login`,
      viewProfile: `${baseurl}/auth2/viewProfile`,
      updateProfile: `${baseurl}/auth2/updateProfile`,
      logout: `${baseurl}/auth2/logout`,
    },

    // QR Code Routes
    qrcode: {
      active: `${baseurl}/qrcode/active`,
    },

    // Attendance Routes
    attend: {
      scan: `${baseurl}/attend/scan`,
      past: `${baseurl}/attend/past`,
      upload: `${baseurl}/attend/upload`,
    },

    // Admin Routes
    admin: {
      records: `${baseurl}/admin/records`,
      singleUser: (id) => `${baseurl}/admin/singleUser/${id}`,
      qrcodes: `${baseurl}/admin/qrcodes`,
      todaysAttendance: `${baseurl}/admin/todays-attendance`,
      deleteUser: (id) => `${baseurl}/admin/user/${id}`,
      dailyReport: `${baseurl}/admin/daily-report`,
      weeklyReport: `${baseurl}/admin/weekly-report`,
    },

    // Password Reset Routes
    password: {
      requestReset: `${baseurl}/password/request-reset`,
      resetPassword: `${baseurl}/password/reset-password`,
    },

    // AI Analytics Routes
    ai: {
      health: `${baseurl}/ai/health`,
      capabilities: `${baseurl}/ai/capabilities`,
      query: `${baseurl}/ai/query`,
    },

    // System Routes
    system: {
      health: `${baseurl}/`,
      logs: {
        scans: `${baseurl}/logs/scans`,
      }
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper function for file upload headers
  const getFileUploadHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for file uploads, let browser set it
    };
  };

  // API Helper Functions
  const apiHelpers = {
    // GET request helper
    get: async (url, useAuth = true) => {
      const headers = useAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      return await response.json();
    },

    // POST request helper
    post: async (url, data, useAuth = true) => {
      const headers = useAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    // PUT request helper
    put: async (url, data, useAuth = true) => {
      const headers = useAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    // DELETE request helper
    delete: async (url, useAuth = true) => {
      const headers = useAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });
      return await response.json();
    },

    // File upload helper
    uploadFile: async (url, formData) => {
      const headers = getFileUploadHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      return await response.json();
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("checkInTime");
    localStorage.removeItem("checkOutTime");
    setUser(null);
  };

  const setAdminView = (view) => {
    setActiveAdminView(view);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    baseurl,
    routes,
    apiHelpers,
    getAuthHeaders,
    getFileUploadHeaders,
    activeAdminView,
    setAdminView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
