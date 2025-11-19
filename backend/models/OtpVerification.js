import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index, deletes document when expiresAt < now
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // flexible temp data
  },
  { timestamps: true }
);

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);
export default OtpVerification;
