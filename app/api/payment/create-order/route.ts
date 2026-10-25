
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Verify that the student is logged in.
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in before making a payment." },
        { status: 401 }
      );
    }

    // 2. Use the server-only admin client for trusted database checks.
    const adminSupabase = createAdminClient();

    // 3. Admin accounts do not need to purchase semester access.
    const { data: profile, error: profileError } = await adminSupabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile check failed:", profileError);
      return NextResponse.json(
        { error: "Could not verify your account." },
        { status: 500 }
      );
    }

    if (profile?.role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts have free access to notes." },
        { status: 403 }
      );
    }

    // 4. Validate the requested semester ID.
    const body = await request.json();
    const semesterId = Number(body.semesterId);

    if (!Number.isSafeInteger(semesterId) || semesterId <= 0) {
      return NextResponse.json(
        { error: "Invalid semester." },
        { status: 400 }
      );
    }

    // 5. Confirm that this semester is available and costs ₹50.
    const { data: semester, error: semesterError } = await adminSupabase
      .from("semesters")
      .select("id, price, status")
      .eq("id", semesterId)
      .maybeSingle();

    if (semesterError) {
      console.error("Semester lookup failed:", semesterError);
      return NextResponse.json(
        { error: "Could not verify the semester." },
        { status: 500 }
      );
    }

    if (!semester || semester.status !== "available") {
      return NextResponse.json(
        { error: "This semester is not currently available." },
        { status: 400 }
      );
    }

    if (Number(semester.price) !== 50) {
      return NextResponse.json(
        { error: "The semester price is not configured correctly." },
        { status: 400 }
      );
    }

    // 6. Do not charge a student who already has active access.
    const now = new Date().toISOString();

    const { data: activePurchase, error: purchaseError } =
      await adminSupabase
        .from("purchases")
        .select("id, expiry_date")
        .eq("user_id", user.id)
        .eq("semester_id", semesterId)
        .eq("paid", true)
        .gt("expiry_date", now)
        .order("expiry_date", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (purchaseError) {
      console.error("Purchase lookup failed:", purchaseError);
      return NextResponse.json(
        { error: "Could not check your current access." },
        { status: 500 }
      );
    }

    if (activePurchase) {
      return NextResponse.json(
        {
          error: `You already have access to this semester until ${new Date(
            activePurchase.expiry_date
          ).toLocaleDateString("en-IN")}.`,
        },
        { status: 409 }
      );
    }

    // 7. Create a Razorpay order using server-side credentials.
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay environment variables are missing.");
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: 5000,
      currency: "INR",
      receipt: `nv_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
      notes: {
        user_id: user.id,
        semester_id: String(semester.id),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 }
    );
  }
}
