// frontend/src/components/ReviewForm.jsx
import { useState } from "react";
import { reviewApi } from "../api/reviewApi.js";
import { paymentApi } from "../api/paymentApi.js";
import toast from "react-hot-toast";
import Button from "./ui/Button.jsx";

export default function ReviewForm({ workerId, bookingId, onSuccess, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating ⭐");

    setLoading(true);
    try {
      // 1️⃣ Save review
      const payload = { jobId: bookingId, rating, comment };
      const res = await reviewApi.addReview(workerId, payload);

      // 2️⃣ Create Razorpay order
      const orderRes = await paymentApi.createOrder({
        amount: res.data?.data?.price || 500,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      const { id: orderId, amount, currency } = orderRes.data.data;

      // 3️⃣ Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "HomeServices",
        description: "Worker Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4️⃣ Verify payment
            const verifyRes = await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful & review submitted!");
              onSuccess?.(res.data?.data);
              onClose?.();
            } else {
              toast.error("❌ Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment failed");
          }
        },
        theme: { color: "#0ea5e9" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Review failed:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
        >
          ✖
        </button>

        {/* Title */}
        <h3 className="text-2xl font-extrabold mb-5 text-center 
                       bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          ⭐ Write a Review
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ⭐ Rating */}
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`cursor-pointer text-3xl transition-colors duration-200 ${
                  (hover || rating) > i ? "text-yellow-400" : "text-gray-300"
                }`}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i + 1)}
              >
                ★
              </span>
            ))}
          </div>

          {/* Comment */}
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="✍️ Share your experience..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                       focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
          ></textarea>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 
                       text-white text-base font-bold shadow-md hover:scale-[1.02] transition-all"
            disabled={loading}
          >
            {loading ? "⏳ Submitting..." : "🚀 Submit & Pay"}
          </Button>
        </form>
      </div>
    </div>
  );
}
