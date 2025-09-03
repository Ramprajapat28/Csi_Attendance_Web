import axios from "axios";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
  "http://localhost:3000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => apiClient.post("/auth2/login", credentials),
  registerUser: (userData) => apiClient.post("/auth2/register-user", userData),
  registerOrg: (orgData) =>
    apiClient.post("/auth2/organization-register", orgData),
  getProfile: () => apiClient.get("/auth2/viewProfile"),
  updateProfile: (data) => apiClient.put("/auth2/updateProfile", data),
  logout: () => apiClient.post("/auth2/logout"),
};

export const attendanceAPI = {
  scanQR: (scanData) => apiClient.post("/attend/scan", scanData),
  getPastAttendance: () => apiClient.get("/attend/past"),
};

export const qrAPI = {
  getActiveQR: (qrType) => apiClient.get(`/qrcode/active?qrType=${qrType}`),
  generateQR: (qrType) => apiClient.post("/qrcode/generate", { qrType }),
};

export const adminAPI = {
  getRecords: () => apiClient.get("/admin/records"),
  getTodaysAttendance: () => apiClient.get("/admin/todays-attendance"),
  getOrgQRCodes: () => apiClient.get("/admin/qrcodes"),
  deleteUser: (userId) => apiClient.delete(`/admin/user/${userId}`),
};

export default apiClient;
