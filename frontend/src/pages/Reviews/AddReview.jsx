// frontend/src/pages/Reviews/AddReview.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { bookingApi } from "../../api/bookingApi.js";
import { paymentApi } from "../../api/paymentApi.js";

export default function AddReview({ bookingId, workerId, price, onClose, onSuccess, retry = false }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!retry && !rating) {
      toast.error("Please select a rating ⭐");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await paymentApi.createOrder({
        amount: price,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      if (!orderRes?.data?.success) {
        toast.error(orderRes?.data?.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const { id: orderId, amount, currency } = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "HomeServices",
        description: retry ? "Retry Payment" : "Worker Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });

            if (!verifyRes?.data?.success) {
              await bookingApi.updatePaymentStatus(bookingId, "failed").catch(() => {});
              toast.error("❌ Payment verification failed");
              return;
            }

            await bookingApi.updatePaymentStatus(bookingId, "paid").catch(() => {});

            if (retry) {
              toast.success("Payment retried & successful");
              onSuccess?.(null);
              onClose?.();
              return;
            }

            const reviewRes = await fetch(
              `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/reviews/${workerId}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ jobId: bookingId, rating, comment }),
              }
            );

            const reviewData = await reviewRes.json();

            if (!reviewData.success) {
              toast.success("Payment successful — but saving review failed. Please try again.");
              onSuccess?.(null);
              onClose?.();
              return;
            }

            toast.success("Payment successful & review saved");
            onSuccess?.(reviewData.data);
            onClose?.();
          } catch (err) {
            console.error("Verification/Review error:", err);
            try { await bookingApi.updatePaymentStatus(bookingId, "failed"); } catch (e) {}
            toast.error("❌ Payment or saving review failed");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "Client",
          email: localStorage.getItem("userEmail") || "client@example.com",
          contact: localStorage.getItem("userPhone") || "9999999999",
        },
        theme: { color: retry ? "#ef4444" : "#0ea5e9" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("AddReview/Retry error:", err);
      toast.error("Something went wrong while starting payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 animate-fade-in">
        <h2 className="text-2xl font-extrabold mb-6 text-center bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {retry ? "🔄 Retry Payment" : "⭐ Add Review & Pay"}
        </h2>

        {!retry && (
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`text-3xl transition-transform hover:scale-125 ${
                      r <= rating ? "text-yellow-400 drop-shadow" : "text-gray-300 hover:text-yellow-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition-all 
              ${retry
                ? "bg-gradient-to-r from-red-500 to-pink-600 hover:brightness-110"
                : "bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:brightness-110"} 
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
          >
            {loading ? "⏳ Processing..." : retry ? "Retry Payment" : "Submit & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}
