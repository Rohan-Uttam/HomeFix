import { Link, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const location = useLocation();
  const paymentData = location.state; // payment verify ke baad bheja gaya data

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      {/* 🎉 Success Badge */}
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 text-white text-4xl shadow-lg mb-6 animate-bounce">
        ✓
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 bg-clip-text mb-4">
        Payment Successful!
      </h1>

      <p className="text-lg text-gray-700 mb-8 max-w-xl">
        Your payment has been processed successfully. Thank you for booking our services.  
        We’ll notify your worker right away 🚀
      </p>

      {/* Extra Details if available */}
      {paymentData && (
        <div className="bg-white p-6 rounded-2xl shadow-md text-left w-full max-w-md mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Payment Details
          </h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>
              <span className="font-medium">💳 Payment ID:</span>{" "}
              {paymentData.razorpay_payment_id}
            </p>
            <p>
              <span className="font-medium">📦 Order ID:</span>{" "}
              {paymentData.razorpay_order_id}
            </p>
            <p>
              <span className="font-medium">💰 Amount:</span> ₹
              {paymentData.amount / 100}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        to="/my-jobs"
        className="bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform"
      >
        Go to My Jobs
      </Link>
    </div>
  );
}
