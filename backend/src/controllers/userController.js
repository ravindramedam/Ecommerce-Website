const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { successResponse, errorResponse } = require("../middlewares/responseHandler");
const { sendVerificationOTP, sendPasswordResetEmail } = require("../services/emailServices");

// Validation regexes for matching certian criteria for inputs
const phoneRegex = /^[6-9]\d{9}$/; // Phone numbers starting 6-9, 10 digits
const emailRegex = /^[^\s@]+@gmail\.com$/i; // Gmail addresses only
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/; // More than 8 chars, one capital, one digit, one special character

// Send OTP for Email Verification
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.user; 
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found", 404);

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Uses Centralized Service
    await sendVerificationOTP(user, otp);

    return successResponse(res, "OTP sent to your email successfully");
  } catch (err) {
    next(err);
  }
};

// Verify OTP for Email Verification
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id); 
    
    if (!user) return errorResponse(res, "User not found", 404);

    if (String(user.otp) !== String(otp) || user.otpExpires < Date.now()) {
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return successResponse(res, "Email verified successfully");
  } catch (err) {
    next(err);
  }
};

// Registering the new User (Default role is "user")
exports.registerUser = async (req, res, next) => {
  const { name, identifier, password } = req.body;

  if (!identifier || !password) {
    return errorResponse(res, "Identifier and password are required", 400);
  }

  let email;
  let phone;
  if (phoneRegex.test(identifier)) {
    phone = identifier;
  } else if (emailRegex.test(identifier)) {
    email = identifier.toLowerCase();
  } else {
    return errorResponse(res, "Identifier must be a valid phone number or Gmail address", 400);
  }

  if (!passwordRegex.test(password)) {
    return errorResponse(
      res,
      "Password must be more than 8 characters and include at least one capital letter, one digit, and one special character.",
      400
    );
  }

  try {
    if (email && (await User.findOne({ email }))) {
      return errorResponse(res, "User already exists with this email", 400);
    }
    if (phone && (await User.findOne({ phone }))) {
      return errorResponse(res, "User already exists with this phone number", 400);
    }

    const userData = { name, password, role: "user" };
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const user = await User.create(userData);

    // Generating JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    return successResponse(res, "User registered successfully", { token, user }, 201);
  } catch (err) {
    next(err);
  }
};

// User Login - email address or phone number, plus password
exports.loginUser = async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return errorResponse(res, "Identifier and password are required", 400);
  }

  const lowerIdentifier = identifier.toLowerCase();
  let query = {};
  if (phoneRegex.test(identifier)) {
    query.phone = identifier;
  } else if (emailRegex.test(lowerIdentifier)) {
    query.email = lowerIdentifier;
  } else {
    return errorResponse(res, "Identifier must be a valid phone number or Gmail address", 400);
  }

  try {
    const user = await User.findOne(query).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, "Invalid identifier or password", 400);
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    return successResponse(res, "Login successful", { token, user });
  } catch (err) {
    next(err);
  }
};

// Profile Management
// Getting User Profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User is not found", 404);

    // We've added the new fields to the response object here
    return successResponse(res, "User profile retrieved successfully", {
      id: user._id,
      name: user.name,
      firstName: user.firstName || '', 
      lastName: user.lastName || '',   
      gender: user.gender || null,     
      isVerified: user.isVerified,     
      email: user.email,
      phone: user.phone || null,
      alternatePhone: user.alternatePhone || null,
      role: user.role,
      profilePicture: user.profilePicture || null
      // We are not including the 'address' field as we have a dedicated address manager.
    });
  } catch (err) {
    next(err);
  }
};

// Updating User Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { 
      name, 
      firstName, 
      lastName, 
      gender, 
      email, 
      phone, 
      alternatePhone, 
      profilePicture 
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, "User not found", 404);

    // Handling Email Update Logic
    if (email && email !== user.email) {
        // Check if this new email is already taken by someone else
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return errorResponse(res, "This email is already associated with another account.", 400);
        }

        user.email = email.toLowerCase();
        // Reseting verification status because the email has changed
        user.isVerified = false; 
    }

    // Handling Phone Update Logic
    if (phone && phone !== user.phone) {
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
             return errorResponse(res, "This phone number is already associated with another account.", 400);
        }
        user.phone = phone;
    }

    // Updating other basic fields ---
    if (name) user.name = name;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (alternatePhone) user.alternatePhone = alternatePhone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    return successResponse(res, "Profile updated successfully", { 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified, 
            gender: user.gender
        } 
    });
  } catch (error) {
    next(error);
  }
};

// Assign Role by admin (Admin Only)
exports.assignRole = async (req, res, next) => {
  const { userId, newRole } = req.body;

  try {
    if (req.user.role !== "admin") {
      return errorResponse(res, "Access denied. Admins only.", 403);
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, "User not found", 404);

    user.role = newRole;
    await user.save();

    return successResponse(res, `User role updated to ${newRole}`, { user });
  } catch (err) {
    next(err);
  }
};

// Password Management
// Forgot Password function (This generates the link to reset the password)
exports.forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
        return errorResponse(res, "Please provide your registered Email or Phone Number", 400);
    }

    let query = {};

    if (phoneRegex.test(identifier)) {
        query.phone = identifier;
    } else if (emailRegex.test(identifier)) {
        query.email = identifier.toLowerCase();
    } else {
        return errorResponse(res, "Invalid Email or Phone Number", 400);
    }

    const user = await User.findOne(query);
    if (!user) return errorResponse(res, "User not found", 404);

    // If user entered phone, we still need an email to send the link.
    if (!user.email) {
        return errorResponse(res, "No email address linked to this phone number. Contact support.", 400);
    }

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // Generate Link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // --- Always send Email ---
    // Regardless of whether they typed Email or Phone, we send to user.email
    await sendPasswordResetEmail(user, resetUrl);
    
    return successResponse(res, `Password reset link sent to ${user.email}`);

  } catch (error) {
    next(error);
  }
};

// Reset Password function
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, "Invalid or expired token", 400);

    if (!newPassword || !passwordRegex.test(newPassword)) {
      return errorResponse(
        res,
        "Password must be more than 8 characters and include at least one capital letter, one digit, and one special character.",
        400
      );
    }

    user.password = newPassword; 
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return successResponse(res, "Password has been reset successfully. Please login.");

  } catch (error) {
    next(error);
  }
};

// Changing Password (not forgetten)
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return errorResponse(res, "User not found", 404);

    // Check if old password matches
    if (!(await user.matchPassword(oldPassword))) {
      return errorResponse(res, "Old password is incorrect", 400);
    }

    // Check if new password matches the last 3 passwords
    const isOldPassword = await Promise.all(
      user.passwordHistory.map(async (oldPass) => bcrypt.compare(newPassword, oldPass))
    );

    if (isOldPassword.includes(true)) {
      return errorResponse(res, "Password is already used in one of the last 3 passwords", 400);
    }

    // Updating password & old one will be stored in passwordHistory
    user.passwordHistory = [user.password, ...user.passwordHistory.slice(0, 2)];
    user.password = newPassword; // Will be hashed automatically

    await user.save();

    return successResponse(res, "Password changed successfully");

  } catch (error) {
    next(error);
  }
};

// ADDRESS Management
// Adding a new address
exports.addAddress = async (req, res, next) => {
  try {
    const { name, addressLine1, city, state, zipCode, phone, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    // If the new address is set as default, make all others not default.
    if (isDefault) {
      user.addresses.forEach(address => (address.isDefault = false));
    }

    // Create the new address object with the correct field names.
    const newAddress = {
      name,
      addressLine1, // We use addressLine1 now
      city,
      state,
      zipCode,
      phone, // We include phone now
      isDefault: isDefault || false
    };

    user.addresses.push(newAddress);
    await user.save();

    return successResponse(res, "Address added successfully", { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// Setting default address
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    // Finding the address and reset all defaults
    user.addresses.forEach(address => (address.isDefault = false));

    const address = user.addresses.id(addressId);
    if (!address) return errorResponse(res, "Address not found", 404);

    address.isDefault = true;
    await user.save();

    return successResponse(res, "Default address updated", { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// Deleting an address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    const address = user.addresses.id(addressId);
    if (!address) return errorResponse(res, "Address not found", 404);

    address.deleteOne();
    await user.save();

    return successResponse(res, "Address deleted successfully", { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// Getting list of all addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Addresses retrieved successfully", { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// Updating an existing address
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { name, addressLine1, city, state, zipCode, phone, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    const address = user.addresses.id(addressId);
    if (!address) return errorResponse(res, "Address not found", 404);
    
    // If this address is being set as the new default
    if (isDefault) {
        user.addresses.forEach(addr => (addr.isDefault = false));
    }

    // Update address fields with the new, correct names.
    address.name = name;
    address.addressLine1 = addressLine1;
    address.city = city;
    address.state = state;
    address.zipCode = zipCode;
    address.phone = phone;
    address.isDefault = isDefault || false;

    await user.save();

    return successResponse(res, "Address updated successfully", { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};
