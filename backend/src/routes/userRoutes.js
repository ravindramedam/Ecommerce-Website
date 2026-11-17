const express = require("express");
const {
  registerUser, loginUser,
  sendOTP, verifyOTP,
  sendPhoneOTP, verifyPhoneOTP,
  forgotPassword, resetPassword, changePassword,
  getUserProfile, updateProfile,
  addAddress, setDefaultAddress, deleteAddress, getAddresses, updateAddress
} = require("../controllers/userController");

const protect = require("../middlewares/auth");

const router = express.Router();

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser); 

// User Profile Routes
router.get("/profile", protect, getUserProfile);  
router.put("/profile", protect, updateProfile);

// Email Verification Routes
router.post("/send-otp", protect, sendOTP); 
router.post("/verify-otp", protect, verifyOTP);
router.post("/send-phone-otp", protect, sendPhoneOTP);
router.post("/verify-phone-otp", protect, verifyPhoneOTP);   

// Password Management Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);  

// Address Management Routes
router.post("/addresses", protect, addAddress); 
router.put("/addresses/:addressId/default", protect, setDefaultAddress);  
router.delete("/addresses/:addressId", protect, deleteAddress); 
router.get("/addresses", protect, getAddresses); 
router.put("/addresses/:addressId", protect, updateAddress); 

module.exports = router;
