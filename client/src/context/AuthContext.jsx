import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Add state for admin navigation
  const [activeAdminView, setActiveAdminView] = useState("home");

  // Base URL for API calls - you can customize later
  const baseurl = "https://csi-attendance-web.onrender.com";

  // Login function to save user and accessToken
  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(userData));
    // console.log(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    // Refresh token cookie is HttpOnly, removed by backend on logout
    setUser(null);
  };

  // Function to change active admin view
  const setAdminView = (view) => {
    setActiveAdminView(view);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        baseurl,
        login,
        logout,
        activeAdminView,
        setActiveAdminView,
        setAdminView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
