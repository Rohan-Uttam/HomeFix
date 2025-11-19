// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      maxlength: 100 
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: { 
      type: String, 
      required: true, 
      minlength: 6, 
      select: false   // ✅ hide password by default
    },

    phone: { 
      type: String, 
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"] 
    },

    role: { 
      type: String, 
      enum: ["client", "worker", "admin"], 
      default: "client" 
    },

    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }, // 👈 Admin control

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0], index: "2dsphere" },
      address: { type: String, default: "" },
    },

    lastLogin: Date,
    avatar: { type: String, default: null }, // frontend fallback if null
  },
  { timestamps: true }
);

// ✅ Compare Password Method
userSchema.methods.comparePassword = async function (candidatePassword, bcrypt) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
