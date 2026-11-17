// src/contexts/AuthContext.js
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // detect whether this dashboard load is first-time
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const router = useRouter();

  const parseUser = (response) => {
    if (!response) return null;
    if (response.data) return response.data;
    if (response.user) return response.user;
    return response;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setIsLoggedIn(false);
        setIsFirstLogin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserProfile();
        const userData = parseUser(response);

        if (!userData) throw new Error("Invalid user format");

        setUser(userData);
        setIsLoggedIn(true);
        setIsFirstLogin(false);
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 401 && status !== 404) {
          console.error("Auth initialization failed:", error?.message || "Request failed");
        }

        localStorage.removeItem("token");
        setUser(null);
        setIsLoggedIn(false);
        setIsFirstLogin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token, responseData) => {
    localStorage.setItem("token", token);
    const userData = parseUser(responseData);

    setUser(userData);
    setIsLoggedIn(true);
    setIsFirstLogin(true);

    router.push("/dashboard");
  };

  const register = (token, responseData) => {
    localStorage.setItem("token", token);
    const userData = parseUser(responseData);

    setUser(userData);
    setIsLoggedIn(true);
    setIsFirstLogin(true);

    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    setIsFirstLogin(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        isFirstLogin,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
