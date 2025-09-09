import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Base URL for API calls - you can customize later
  const baseurl = "https://csi-attendance-web-s1yf.onrender.com";

  // Login function to save user and accessToken
  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(userData));
    // console.log(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    // Refresh token cookie is HttpOnly, removed by backend on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, baseurl ,setUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
