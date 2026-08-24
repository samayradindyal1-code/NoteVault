"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const semesterId = Number(searchParams.get("semesterId"));

  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    try {
      setLoading(true);

      // Current User
      const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION =", session);

if (!session?.user) {
  alert("Please login first.");
  return;
}

const user = session.user;

      // Check Existing Purchase
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester_id", semesterId)
        .maybeSingle();

      // Fixed expiry for first purchase
const firstExpiry = new Date("2026-11-20T23:59:59");

// Renewal expiry (3 months from payment)
const renewalExpiry = new Date();
renewalExpiry.setMonth(renewalExpiry.getMonth() + 3);

      // Existing Purchase Found
      if (existingPurchase) {
        const isActive =
          new Date(existingPurchase.expiry_date) > new Date();

        if (isActive) {
          alert("You already have access to this semester.");
          router.push(`/semester/${semesterId}`);
          return;
        }

        // Renew Subscription
const { error } = await supabase
  .from("purchases")
  .update({
    paid: true,
    payment_id: "TEST_PAYMENT",
    expiry_date: renewalExpiry.toISOString(),
    created_at: new Date().toISOString(),
  })
  .eq("id", existingPurchase.id);

        if (error) throw error;

        alert("Subscription renewed successfully 🎉");
      } else {
        // First Purchase
const { error } = await supabase
  .from("purchases")
  .insert({
    user_id: user.id,
    semester_id: semesterId,
    payment_id: "TEST_PAYMENT",
    paid: true,
    expiry_date: firstExpiry.toISOString(),
    created_at: new Date().toISOString(),
  });

if (error) throw error;

alert("Payment Successful 🎉");
      }

      router.push(`/semester/${semesterId}`);
    } catch (error: any) {
  console.log("FULL ERROR =", error);

  if (error?.message) {
    alert(error.message);
  } else {
    alert(JSON.stringify(error, null, 2));
  }
} finally {
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
  First access valid till <b>20 Nov 2026</b>
</p>

<p className="text-sm text-gray-500">
  After expiry, every renewal gives 3 months access.
</p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Pay ₹50"}
        </button>
      </div>
    </div>
  );
}