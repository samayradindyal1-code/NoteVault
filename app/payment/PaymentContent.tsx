"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const semesterId = Number(searchParams.get("semesterId"));
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay Checkout
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      alert("Razorpay could not be loaded. Please try again.");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handlePayment() {
    try {
      if (!semesterId || !Number.isSafeInteger(semesterId)) {
        alert("Invalid semester.");
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        alert("Payment system is still loading. Please try again.");
        return;
      }

      setLoading(true);

      // 1. Create secure Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semesterId,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData?.error || "Could not create payment order."
        );
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NoteVault",
        description: "Semester Notes Access",
        order_id: orderData.orderId,

        handler: async function (response: any) {
          try {
            setLoading(true);

            // 3. Verify payment on our server
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.verified) {
              throw new Error(
                verifyData?.error || "Payment verification failed."
              );
            }

            alert("Payment verified successfully 🎉");

            // Purchase activation will be handled securely
            // on the server after verification.

            router.push(`/semester/${semesterId}`);
          } catch (error: any) {
            console.error("Verification error:", error);
            alert(error?.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response?.error);

        alert(
          response?.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold">
          Unlock Semester Notes
        </h1>

        <p className="mt-3 text-gray-600">
          Access all notes of this semester.
        </p>

        <h2 className="mt-6 text-4xl font-bold text-blue-600">
          ₹50
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Access valid for <b>2 months</b> from the date of purchase.
        </p>

        <button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading
            ? "Processing..."
            : !razorpayLoaded
            ? "Loading Payment..."
            : "Pay ₹50"}
        </button>
      </div>
    </div>
  );
}