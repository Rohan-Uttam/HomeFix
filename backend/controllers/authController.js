// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import OtpVerification from "../models/OtpVerification.js";
import { generateToken } from "../utils/tokenService.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";
import { sendEmail } from "../utils/emailService.js";
import { sendSMS } from "../utils/smsService.js";

/**
 * Helper to get uploaded file url (works for local multer or multer-cloudinary)
 */
const getUploadedFileUrl = (file) => {
  if (!file) return null;
  // multer-cloudinary might put secure_url, other multer stores path
  return file.path || file.secure_url || file.url || null;
};

/**
 * Parse location input which might be:
 * - an object { lat, lng, address }
 * - an object with coordinates: { type, coordinates: [lng, lat], address }
 * - a JSON stringified object
 * Returns normalized object { lat, lng, address }
 */
const parseLocation = (loc) => {
  if (!loc) return null;
  try {
    const obj = typeof loc === "string" ? JSON.parse(loc) : loc;

    // If it's GeoJSON style
    if (obj?.coordinates && Array.isArray(obj.coordinates)) {
      const [lng, lat] = obj.coordinates;
      return {
        lat: lat != null ? Number(lat) : 0,
        lng: lng != null ? Number(lng) : 0,
        address: obj.address || obj.addr || "",
      };
    }

    // If already { lat, lng }
    if (obj?.lat != null || obj?.lng != null) {
      return {
        lat: Number(obj.lat) || 0,
        lng: Number(obj.lng) || 0,
        address: obj.address || obj.addr || "",
      };
    }

    // Otherwise, try address-only
    if (obj?.address) {
      return { lat: 0, lng: 0, address: obj.address };
    }

    return null;
  } catch (e) {
    return null;
  }
};

// ---------------- REGISTER (Step 1: Save OTP + Temp User Data) ----------------
export const register = async (req, res, next) => {
  try {
    const raw = req.body || {};

    // Accept fields from body (may be FormData)
    const {
      name,
      email,
      password,
      role = "client",
      phone,
      skills,
      hourlyRate,
      rateType,
      experience,
      bio,
      availability,
      category,
      subcategory,
      customCategory,
      location,
    } = raw;

    // Profile image helpers (avatar/profileImage)
    let profileImage = null;
    const fileUrl = getUploadedFileUrl(req.file);
    if (fileUrl) profileImage = fileUrl;
    else if (raw.profileImage) profileImage = raw.profileImage;
    else if (raw.avatar) profileImage = raw.avatar;

    if (!email || !password || !name || !phone) {
      return errorResponse(res, "Name, email, password and phone are required", 400);
    }

    // Prevent duplicates early
    const exists = await User.findOne({ email });
    if (exists) {
      return errorResponse(res, "User already exists", 400);
    }

    // Build data to store temporarily in OTP record.
    // Normalize skills: if it's comma string -> array
    let skillsArr = [];
    if (skills) {
      if (Array.isArray(skills)) skillsArr = skills;
      else if (typeof skills === "string") {
        try {
          // maybe JSON array string
          const parsed = JSON.parse(skills);
          if (Array.isArray(parsed)) skillsArr = parsed;
          else skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);
        } catch (e) {
          skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    // Parse location (could be stringified JSON)
    const parsedLocation = parseLocation(location);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // set longer expiry (e.g. 5 minutes) — change if you want shorter
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpVerification.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt,
        data: {
          name,
          email,
          password,
          role,
          phone,
          skills: skillsArr,
          hourlyRate,
          rateType,
          category,
          subcategory,
          customCategory,
          experience,
          bio,
          availability,
          profileImage,
          location: parsedLocation,
        },
      },
      { upsert: true, new: true }
    );

    try {
      await sendEmail(email, "Your HomeServices OTP", `Your OTP is: ${otp}`);
    } catch (e) {
      console.warn("sendEmail failed:", e?.message);
    }
    try {
      await sendSMS(phone, `Your HomeServices OTP: ${otp}`);
    } catch (e) {
      console.warn("sendSMS failed:", e?.message);
    }

    return successResponse(res, "OTP sent successfully", { email, phone }, 200);
  } catch (err) {
    next(err);
  }
};

// ---------------- RESEND OTP ----------------
export const resendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return errorResponse(res, "Email and phone are required", 400);
    }

    const record = await OtpVerification.findOne({ email });
    if (!record) {
      return errorResponse(res, "No OTP request found, please register again", 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    record.otp = otp;
    record.expiresAt = expiresAt;
    await record.save();

    try {
      await sendEmail(email, "Your HomeServices OTP (Resend)", `Your OTP is: ${otp}`);
    } catch (e) {
      console.warn("sendEmail failed:", e?.message);
    }
    try {
      await sendSMS(phone, `Your HomeServices OTP (Resend): ${otp}`);
    } catch (e) {
      console.warn("sendSMS failed:", e?.message);
    }

    return successResponse(res, "New OTP sent successfully", { email, phone }, 200);
  } catch (err) {
    next(err);
  }
};

// ---------------- VERIFY OTP (Step 2: Create User + WorkerProfile) ----------------
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return errorResponse(res, "Email and OTP are required", 400);
    }

    const record = await OtpVerification.findOne({ email });
    if (!record) {
      return errorResponse(res, "No OTP found. Please register again.", 400);
    }

    if (record.otp !== otp) return errorResponse(res, "Invalid OTP", 400);
    if (record.expiresAt < new Date()) return errorResponse(res, "OTP expired", 400);

    const data = record.data || {};
    const {
      name,
      password,
      role,
      phone,
      skills,
      hourlyRate,
      rateType,
      category,
      subcategory,
      customCategory,
      experience,
      bio,
      availability,
      profileImage = null,
      location,
    } = data;

    if (!password) {
      return errorResponse(res, "Registration data corrupted, please register again", 400);
    }

    // Avoid duplicates
    let existing = await User.findOne({ email });
    if (existing) {
      await OtpVerification.deleteOne({ email });
      return errorResponse(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      avatar: profileImage || null,
      isVerified: true,
    });

    // Normalize location: accept either {lat,lng,address} or {coordinates: [lng,lat]}
    const loc = location || null;
    const safeLng = loc?.coordinates?.[0] ?? loc?.lng ?? 0;
    const safeLat = loc?.coordinates?.[1] ?? loc?.lat ?? 0;
    const safeAddress = loc?.address || "Not Provided";

    if (role === "worker") {
      // ensure category/customCategory logic
      const cat = category || (customCategory ? "other" : undefined);
      const customCatVal =
        (cat && String(cat).toLowerCase() === "other" && customCategory)
          ? customCategory
          : "";

      await WorkerProfile.create({
        user: user._id,
        skills: Array.isArray(skills) ? skills : skills ? [skills] : [],
        hourlyRate: hourlyRate || 0,
        rateType: rateType || "hourly",
        category: cat || "Other",
        customCategory: customCatVal || "",
        subcategory: subcategory || undefined,
        experience: Number(experience) || 0,
        bio: bio || "",
        availability: availability || "flexible",
        profileImage: profileImage || null,
        location: {
          type: "Point",
          coordinates: [safeLng || 0, safeLat || 0],
          address: safeAddress || "Not Provided",
        },
        currentLocation: {
          type: "Point",
          coordinates: [safeLng || 0, safeLat || 0],
        },
      });
    }

    await OtpVerification.deleteOne({ email });

    const token = generateToken({ id: user._id.toString(), role: user.role });

    return successResponse(
      res,
      "OTP verified, user registered",
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar || null,
        },
        token,
      },
      201
    );
  } catch (err) {
    console.error("verifyOtp error:", err);
    next(err);
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return errorResponse(res, "Invalid credentials", 400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid credentials", 400);

    if (!user.isVerified) {
      return errorResponse(res, "Please verify your account first", 400);
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });

    // optional: set cookie for token (helpful if frontend expects cookie)
    try {
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } catch (e) {
      // ignore if cookies not desired
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar || null,
    };

    return successResponse(res, "Login successful", { user: userData, token }, 200);
  } catch (err) {
    console.error("login error:", err);
    next(err);
  }
};

// ---------------- PROFILE ----------------
export const profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Profile fetched successfully", user, 200);
  } catch (err) {
    next(err);
  }
};
