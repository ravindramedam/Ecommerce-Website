// frontend-user/src/components/auth/LoginForm.js

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/apiService";
import { forgotPassword } from "@/services/userService"; 

export default function LoginForm() {
  const { login } = useAuth();
  
  // --- LOGIN STATES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- FORGOT PASSWORD STATES ---
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetStatus, setResetStatus] = useState({ loading: false, message: "", type: "" });

  // 1. HANDLE LOGIN
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill both email and password.");
      setLoading(false);
      return;
    }

    const trimmed = email.trim();
    const isPhone = /^[6-9]\d{9}$/.test(trimmed);
    const isEmail = /^[^\s@]+@gmail\.com$/i.test(trimmed);
    if (!isPhone && !isEmail) {
      setError("Enter a valid Gmail address or 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.post('/users/login', { 
        identifier: trimmed, 
        password 
      });
      const data = res.data; 
      login(data.data.token, data.data.user); 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // 2. HANDLE FORGOT PASSWORD
  async function handleForgotSubmit(e) {
    e.preventDefault();
    setResetStatus({ loading: true, message: "", type: "" });

    if (!resetIdentifier) {
      setResetStatus({ loading: false, message: "Please enter your email or phone.", type: "error" });
      return;
    }

    try {
      // Call the service function
      const response = await forgotPassword(resetIdentifier);
      
      setResetStatus({ 
        loading: false, 
        // Use the message from backend or a fallback
        message: response.message || `Reset link sent to ${resetIdentifier}. Check your inbox/SMS.`, 
        type: "success" 
      });
    } catch (err) {
      setResetStatus({ 
        loading: false, 
        message: err.response?.data?.message || "Failed to send reset link. User may not exist.", 
        type: "error" 
      });
    }
  }

  // --- RENDER: FORGOT PASSWORD VIEW ---
  if (isForgotPasswordView) {
    return (
      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Reset your password</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email or phone number and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {resetStatus.message && (
          <div className={`mb-4 border px-4 py-3 rounded text-sm ${
            resetStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {resetStatus.message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleForgotSubmit}>
          <div>
            <label htmlFor="reset-identifier" className="block text-sm font-medium text-gray-700">
              Email or Phone Number<span className="text-black">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="reset-identifier"
                required
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                className="block w-full text-blue-900 bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., ravi@gmail.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={resetStatus.loading}
              className={`w-full flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm ${
                resetStatus.loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {resetStatus.loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPasswordView(false);
                setResetStatus({ message: "", type: "" }); // Clear messages when going back
              }}
              className="w-full flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 font-medium shadow-sm hover:bg-gray-50 sm:text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- RENDER: LOGIN VIEW ---
  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address or Phone Number<span className="text-black">*</span>
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full text-blue-900 bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password<span className="text-black">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPasswordView(true)}
              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>
          <div className="mt-1 relative"> 
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full text-blue-900 bg-white appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.032 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-3.289-3.289" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}