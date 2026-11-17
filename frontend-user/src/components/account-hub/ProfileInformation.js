// frontend-user/src/components/account-hub/ProfileInformation.js

"use client";

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getUserProfile,
  updateUserProfile,
  sendOtp,
  verifyOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  changePassword,
  forgotPassword
} from '@/services/userService.js';

export default function ProfileInformation() {
  // --- Profile State ---
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- Password State ---
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // --- OTP State ---
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationStatus, setVerificationStatus] = useState({ message: '', type: '' });
  const [timer, setTimer] = useState(0);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState({ message: '', type: '' });
  const [phoneTimer, setPhoneTimer] = useState(0);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      const userData = data.data;
      setUser(userData);

      setFormData({
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        gender: userData.gender || 'Other',
        phone: userData.phone || '',
        // NEW: Load email into form data (it might be empty if phone user)
        email: userData.email || '', 
      });
    } catch {
      setError('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (passwordStatus.message) {
      const t = setTimeout(() => setPasswordStatus({ message: '', type: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [passwordStatus]);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let interval;
    if (phoneTimer > 0) interval = setInterval(() => setPhoneTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [phoneTimer]);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    const dataToUpdate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email, // NEW: Send email to backend
    };

    try {
      await updateUserProfile(dataToUpdate);
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      
      setIsEditMode(false);
      await fetchProfile(); // Refresh to see new email and potentially reset status
    } catch (err) {
       // Handle "Email already in use" error specifically
       const errMsg = err.response?.data?.message || ( typeof err.response?.data === "string" ? err.response.data : 'Failed to save changes.');
       toast.error(errMsg);
       setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    // Safety check: Cannot send OTP if no email exists
    if (!user?.email) {
        setError("Please add an email address first.");
        return;
    }

    if (timer > 0) return;

    setVerificationStatus({ message: 'Sending OTP...', type: 'loading' });

    try {
      await sendOtp();
      setOtpSent(true);
      setTimer(60);
      setVerificationStatus({ message: 'OTP sent to email!', type: 'success' });
    } catch {
      setVerificationStatus({ message: 'Failed to send OTP.', type: 'error' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerificationStatus({ message: 'Verifying...', type: 'loading' });

    try {
      await verifyOtp(otp);
      setVerificationStatus({ message: 'Email verified!', type: 'success' });
      await fetchProfile();
      setOtp('');
      setOtpSent(false);
    } catch {
      setVerificationStatus({ message: 'Invalid OTP.', type: 'error' });
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!user?.phone) {
      setError("Please add a mobile number first.");
      return;
    }
    if (phoneTimer > 0) return;

    setPhoneVerificationStatus({ message: 'Sending OTP...', type: 'loading' });
    try {
      await sendPhoneOtp();
      setPhoneOtpSent(true);
      setPhoneTimer(60);
      setPhoneVerificationStatus({ message: 'OTP sent to your mobile number!', type: 'success' });
    } catch {
      setPhoneVerificationStatus({ message: 'Failed to send OTP.', type: 'error' });
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    setPhoneVerificationStatus({ message: 'Verifying...', type: 'loading' });
    try {
      await verifyPhoneOtp(phoneOtp);
      setPhoneVerificationStatus({ message: 'Mobile number verified!', type: 'success' });
      await fetchProfile();
      setPhoneOtp('');
      setPhoneOtpSent(false);
    } catch {
      setPhoneVerificationStatus({ message: 'Invalid OTP.', type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmNewPassword) {
      return setPasswordStatus({ message: 'Fill all fields.', type: 'error' });
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return setPasswordStatus({ message: 'Passwords do not match.', type: 'error' });
    }

    setIsSavingPassword(true);

    try {
      const res = await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordStatus({ message: res.message || 'Password changed!', type: 'success' });
      setIsChangePasswordOpen(false);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      setPasswordStatus({
        message: err.response?.data?.message || 'Failed.',
        type: 'error'
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    const identifier = user?.email || user?.phone;
    if (!identifier) {
      return setPasswordStatus({ message: 'No email or phone found.', type: 'error' });
    }

    setIsSendingReset(true);
    setPasswordStatus({ message: 'Sending reset link...', type: 'loading' });

    try {
      await forgotPassword(identifier);
      setPasswordStatus({
        message: `Reset link sent to ${identifier}.`,
        type: 'success'
      });
    } catch {
      setPasswordStatus({ message: 'Failed to send link.', type: 'error' });
    } finally {
      setIsSendingReset(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading profile...</div>;

  const inputClass =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 " +
    "focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[10px] sm:text-sm";

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-gray-100 text-[10px] sm:text-sm">

      {/* Global Alerts */}
      {success && (
        <div className="mb-3 p-2 bg-green-50 text-green-700 rounded text-[10px] sm:text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-[10px] sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* EDIT MODE */}
      {/* ------------------------------------------------------ */}
      {isEditMode ? (
        <form onSubmit={handleSave}>
          <h2 className="text-[12px] sm:text-lg font-bold mb-3 text-gray-800">
            Edit Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">

            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

          </div>

          {/* NEW: Email Input in Edit Mode */}
          <div className="mt-3 sm:mt-5">
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="example@gmail.com"
            />
            <p className="text-[9px] sm:text-xs text-gray-500 mt-1">
              Changing email will require re-verification.
            </p>
          </div>

          {/* Gender */}
          <div className="mt-3 sm:mt-5">
            <p className="text-[10px] sm:text-sm font-medium text-gray-700">Gender</p>
            <div className="flex items-center gap-6 mt-1">

              {["male", "female"].map((g) => (
                <label key={g} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleInputChange}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <span className="text-[10px] sm:text-sm capitalize">{g}</span>
                </label>
              ))}

            </div>
          </div>

          {/* Phone */}
          <div className="mt-3 sm:mt-5">
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9]*"
              value={formData.phone}
              onChange={handleInputChange}
              className={inputClass}
            />
            <p className="text-[9px] sm:text-xs text-gray-500 mt-1">
              Changing mobile number will require re-verification.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-2">

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-1.5 px-3 bg-blue-600 text-white rounded text-[10px] sm:text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="flex-1 py-1.5 px-3 bg-white border border-gray-300 text-gray-700 rounded text-[10px] sm:text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>

          </div>
        </form>
      ) : (

      /* ------------------------------------------------------ */
      /* VIEW MODE */
      /* ------------------------------------------------------ */
        <div>
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-[12px] sm:text-lg font-bold text-gray-800">
              Personal Info
            </h2>
            <button
              onClick={() => setIsEditMode(true)}
              className="text-blue-600 text-[10px] sm:text-sm font-semibold hover:underline"
            >
              Edit
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">

            <div>
              <p className="text-[10px] sm:text-xs font-medium text-gray-500">Full Name</p>
              <p className="mt-0.5 text-[11px] sm:text-base font-semibold text-gray-900">
                {user?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] sm:text-xs font-medium text-gray-500">Gender</p>
              <p className="mt-0.5 text-[11px] sm:text-base font-semibold text-gray-900 capitalize">
                {user?.gender || "-"}
              </p>
            </div>

            <div className="sm:col-span-2 bg-gray-50 p-3 rounded">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600">Mobile Number</p>
                  {user?.phone ? (
                    <p className="mt-0.5 text-[11px] sm:text-base font-semibold text-gray-900">
                      {user.phone}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] sm:text-sm font-bold text-red-500">
                      No mobile number linked!
                    </p>
                  )}
                </div>

                {user?.isPhoneVerified ? (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] sm:text-xs font-semibold">
                    Verified
                  </span>
                ) : !user?.phone ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="mt-2 sm:mt-0 px-3 py-1 bg-blue-600 text-white rounded text-[10px] sm:text-sm hover:bg-blue-700"
                  >
                    Add Mobile
                  </button>
                ) : (
                  <button
                    onClick={handleSendPhoneOtp}
                    disabled={phoneTimer > 0}
                    className={`mt-2 sm:mt-0 text-[10px] sm:text-sm font-medium ${
                      phoneTimer > 0
                        ? "text-gray-400"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {phoneTimer > 0 ? `Retry in ${phoneTimer}s` : "Verify Mobile"}
                  </button>
                )}
              </div>

              {phoneOtpSent && !user?.isPhoneVerified && (
                <form
                  onSubmit={handleVerifyPhoneOtp}
                  className="mt-3 flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      maxLength={6}
                      className={inputClass}
                      placeholder="123456"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-blue-600 text-white rounded text-[10px] sm:text-sm hover:bg-blue-700"
                  >
                    Verify
                  </button>
                </form>
              )}

              {phoneVerificationStatus.message && (
                <p
                  className={`mt-2 text-[10px] sm:text-xs font-semibold ${
                    phoneVerificationStatus.type === "error"
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {phoneVerificationStatus.message}
                </p>
              )}
            </div>

            {/* Email Box */}
            <div className="sm:col-span-2 bg-gray-50 p-3 rounded">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600">Email Address</p>
                  
                  {user?.email ? (
                    <p className="mt-0.5 text-[11px] sm:text-base font-semibold text-gray-900 break-all">
                        {user.email}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] sm:text-sm font-bold text-red-500">
                       No email linked!
                    </p>
                  )}
                </div>

                {/* LOGIC: 
                    1. If Verified: Show Badge.
                    2. If No Email: Show "Add Email" button (opens edit mode).
                    3. If Email Exists but Unverified: Show "Verify" button. 
                */}

                {user?.isVerified ? (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] sm:text-xs font-semibold">
                    Verified
                  </span>
                ) : !user?.email ? (
                    <button
                        onClick={() => setIsEditMode(true)}
                        className="mt-2 sm:mt-0 px-3 py-1 bg-blue-600 text-white rounded text-[10px] sm:text-sm hover:bg-blue-700"
                    >
                        Add Email
                    </button>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={timer > 0}
                    className={`mt-2 sm:mt-0 text-[10px] sm:text-sm font-medium ${
                      timer > 0
                        ? "text-gray-400"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {timer > 0 ? `Retry in ${timer}s` : "Verify Email"}
                  </button>
                )}
              </div>

              {otpSent && !user?.isVerified && (
                <form
                  onSubmit={handleVerifyOtp}
                  className="mt-3 flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className={inputClass}
                      placeholder="123456"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-blue-600 text-white rounded text-[10px] sm:text-sm hover:bg-blue-700"
                  >
                    Verify
                  </button>
                </form>
              )}

              {verificationStatus.message && (
                <p
                  className={`mt-2 text-[10px] sm:text-xs font-semibold ${
                    verificationStatus.type === "error"
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {verificationStatus.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* SECURITY SECTION */}
      {/* ------------------------------------------------------ */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <h2 className="text-[12px] sm:text-lg font-bold text-gray-800">
            Security
          </h2>
          <button
            onClick={() => {
              setIsChangePasswordOpen(!isChangePasswordOpen);
              setPasswordStatus({ message: "", type: "" });
            }}
            className="text-blue-600 text-[10px] sm:text-sm font-semibold hover:underline"
          >
            {isChangePasswordOpen ? "Cancel" : "Change Password"}
          </button>
        </div>

        {passwordStatus.message && (
          <div
            className={`mt-3 p-2 rounded text-[10px] sm:text-sm font-medium ${
              passwordStatus.type === "success"
                ? "bg-green-50 text-green-700"
                : passwordStatus.type === "loading"
                ? "bg-blue-50 text-blue-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {passwordStatus.message}
          </div>
        )}

        {isChangePasswordOpen && (
          <form
            onSubmit={handleChangePassword}
            className="mt-4 max-w-md space-y-3"
          >
            {/* Current Password */}
            <div>
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))
                  }
                  className={inputClass}
                />

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    disabled={isSendingReset}
                    className="text-[9px] sm:text-xs text-blue-600 hover:underline disabled:text-gray-400"
                  >
                    {isSendingReset ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
              </div>
            </div>

            {["newPassword", "confirmNewPassword"].map((field, idx) => (
              <div key={field}>
                <label className="block text-[10px] sm:text-sm font-medium text-gray-700">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>

                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name={field}
                    value={passwordData[field]}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        [field]: e.target.value
                      }))
                    }
                    className={inputClass}
                  />

                  {idx === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[9px] sm:text-xs text-gray-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="w-full py-2 bg-blue-600 text-white text-[10px] sm:text-sm rounded hover:bg-blue-700 disabled:opacity-50 mt-3"
            >
              {isSavingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
