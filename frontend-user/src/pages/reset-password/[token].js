// frontend-user/src/pages/reset-password/[token].js 

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout'; 
import { resetPassword } from '@/services/userService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query; // Capture the token from the URL

  // Form State
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [status, setStatus] = useState({ loading: false, type: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Handlers ---
  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: '', message: '' });

    // 1. Basic Validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      setStatus({
        loading: false,
        type: 'error',
        message: 'Password must be more than 8 characters and include at least one capital letter, one digit, and one special character.',
      });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ loading: false, type: 'error', message: 'Passwords do not match.' });
      return;
    }

    // 2. API Call
    try {
      if (!token) throw new Error("Invalid token. Please try the link again.");
      
      const response = await resetPassword(token, passwords.newPassword);
      
      setIsSuccess(true);
      setStatus({ 
        loading: false, 
        type: 'success', 
        message: response.message || 'Password reset successful! Redirecting...' 
      });

      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/auth/login'), 3000);

    } catch (err) {
      setStatus({ 
        loading: false, 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to reset password. Link may be expired.' 
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new secure password below.
            </p>
          </div>

          {/* Alert Messages */}
          {status.message && (
            <div className={`p-4 rounded-md text-sm font-medium ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.message}
            </div>
          )}

          {/* Success State - Hide Form */}
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500">You can now sign in with your new password.</p>
              <Link 
                href="/auth/login"
                className="inline-block w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password<span className="text-black">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password<span className="text-black">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status.loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                >
                  {status.loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}