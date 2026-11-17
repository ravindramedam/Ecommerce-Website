const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Cart = require("./Cart")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    firstName: {   // Added firstName, lastName fields for future editing in profile information and storing first name and last name separately
      type: String 
    },
    lastName: { 
      type: String 
    },
    gender: { 
      type: String, 
      enum: ["male", "female", "Other"], 
      default: "Other" 
    },

    address: { 
      type: String 
    },
    addresses: [
        {
            name: String,         
            addressLine1: String,
            city: String,
            state: String,
            zipCode: String,
            phone: String,        
            isDefault: { type: Boolean, default: false }
        }
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true
    },  
    alternatePhone: { 
      type: String, 
      default: "" 
    }, 
    role: {
      type: String,
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true 
    },
    isBlocked: { 
      type: Boolean, 
      default: false 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    }, 
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    otp: { 
      type: String
    }, 
    otpExpires: { 
      type: Date
    },
    phoneOtp: {
      type: String
    },
    phoneOtpExpires: {
      type: Date
    }, 
    resetPasswordToken: { 
      type: String 
    },
    resetPasswordExpires: { 
      type: Date 
    },
    passwordHistory: { 
      type: [String], 
      default: [] 
    }
  },
  { timestamps: true }
);

// Hashing the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// comparing password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  const result = await bcrypt.compare(enteredPassword, this.password);
  return result;
};

// Deleting cart automatically when user is deleted
userSchema.pre("findOneAndDelete", async function (next) {
  const userId = this.getQuery()._id;
  await Cart.deleteOne({ userId });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
