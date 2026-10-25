import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured." },
        { status: 500 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== 5000 ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment is not captured or does not match the expected amount.",
        },
        { status: 400 }
      );
    }

    // Verify order
    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (
      order.amount !== 5000 ||
      order.currency !== "INR" ||
      order.status !== "paid" ||
      order.notes?.user_id !== user.id ||
      !order.notes?.semester_id
    ) {
      return NextResponse.json(
        { error: "Order validation failed." },
        { status: 400 }
      );
    }

    const semesterId = Number(order.notes.semester_id);

    if (!Number.isSafeInteger(semesterId) || semesterId <= 0) {
      return NextResponse.json(
        { error: "Invalid semester in payment order." },
        { status: 400 }
      );
    }

    // Server-side admin client
    const admin = createAdminClient();

    // Validate semester
    const { data: semester, error: semesterError } = await admin
      .from("semesters")
      .select("id, price, status")
      .eq("id", semesterId)
      .maybeSingle();

    if (semesterError || !semester) {
      return NextResponse.json(
        { error: "Semester could not be validated." },
        { status: 400 }
      );
    }

    if (semester.status !== "available") {
      return NextResponse.json(
        { error: "This semester is not available." },
        { status: 400 }
      );
    }

    if (Number(semester.price) !== 50) {
      return NextResponse.json(
        { error: "Semester price is not configured correctly." },
        { status: 400 }
      );
    }

    
    // Check whether this Razorpay payment ID has already been used.
    const { data: paymentRecord, error: paymentRecordError } =
      await admin
        .from("purchases")
        .select("id, user_id, semester_id, payment_id, paid, expiry_date")
        .eq("payment_id", razorpay_payment_id)
        .limit(1)
        .maybeSingle();

    if (paymentRecordError) {
      console.error("Payment record lookup failed:", paymentRecordError);
      return NextResponse.json(
        { error: "Could not validate the payment record." },
        { status: 500 }
      );
    }

    if (paymentRecord) {
      if (
        paymentRecord.user_id === user.id &&
        Number(paymentRecord.semester_id) === semesterId &&
        paymentRecord.paid === true
      ) {
        return NextResponse.json({
          verified: true,
          activated: true,
          message: "Payment already activated.",
          expiryDate: paymentRecord.expiry_date,
        });
      }

      return NextResponse.json(
        { error: "This payment has already been used." },
        { status: 409 }
      );
    }

    // Find the latest purchase for this student and semester.
    // limit(1) avoids maybeSingle() failing when older duplicate rows exist.
    const { data: existingPurchase, error: purchaseLookupError } =
      await admin
        .from("purchases")
        .select("id, user_id, semester_id, payment_id, paid, expiry_date")
        .eq("user_id", user.id)
        .eq("semester_id", semesterId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (purchaseLookupError) {
      console.error("Purchase lookup failed:", purchaseLookupError);
      return NextResponse.json(
        { error: "Could not check the existing purchase." },
        { status: 500 }
      );
    }


    
    // 2 months access
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 2);

    const purchaseData = {
      user_id: user.id,
      semester_id: semesterId,
      payment_id: razorpay_payment_id,
      paid: true,
      expiry_date: expiryDate.toISOString(),
      created_at: new Date().toISOString(),
    };

    let activationError;

    if (existingPurchase) {
      const { error } = await admin
        .from("purchases")
        .update(purchaseData)
        .eq("id", existingPurchase.id)
        .eq("user_id", user.id);

      activationError = error;
    } else {
      const { error } = await admin
        .from("purchases")
        .insert(purchaseData);

      activationError = error;
    }

    if (activationError) {
      console.error("Purchase activation failed:", activationError);

      return NextResponse.json(
        {
          error:
            "Payment was verified, but access activation failed. Please contact support with your payment ID.",
          paymentId: razorpay_payment_id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verified: true,
      activated: true,
      expiryDate: expiryDate.toISOString(),
      message: "Payment successful and semester access activated.",
    });


  } catch (error) {
    console.error("Payment verification failed:", error);

    return NextResponse.json(
      { error: "Could not verify payment." },
      { status: 500 }
    );
  }
}