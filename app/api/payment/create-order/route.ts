
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const semesterId = Number(body.semesterId);

    if (!Number.isSafeInteger(semesterId) || semesterId <= 0) {
      return NextResponse.json(
        { error: "Invalid semester." },
        { status: 400 }
      );
    }

    const { data: semester, error: semesterError } = await supabase
      .from("semesters")
      .select("id, price, status")
      .eq("id", semesterId)
      .maybeSingle();

    if (semesterError) {
      console.error("Semester lookup failed:", semesterError.message);
      return NextResponse.json(
        { error: "Could not validate semester." },
        { status: 500 }
      );
    }

    if (!semester || semester.status !== "available") {
      return NextResponse.json(
        { error: "This semester is not available for purchase." },
        { status: 400 }
      );
    }

    if (Number(semester.price) !== 50) {
      return NextResponse.json(
        { error: "Semester price must be configured as ₹50." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server." },
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
      receipt: `nv_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`,
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
    console.error("Create order failed:", error);

    return NextResponse.json(
      { error: "Could not create payment order." },
      { status: 500 }
    );
  }
}