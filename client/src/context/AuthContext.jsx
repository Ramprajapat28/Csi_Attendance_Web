import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAdminView, setActiveAdminView] = useState("home");

  const baseurl = "https://csi-attendance-web.onrender.com";

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
