import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin"; // <--- Import the ADMIN DB
import { FieldValue } from "firebase-admin/firestore"; // <--- Import FieldValue from Admin

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderCreationId, razorpayPaymentId, razorpaySignature, userId } = body;

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid Transaction" }, { status: 400 });
    }

    // 2. Update Database using ADMIN SDK (Bypasses Rules)
    console.log(`Payment Verified. Upgrading User: ${userId}`);
    
    // Note: We use 'adminDb' here, not 'db'
    await adminDb.collection("users").doc(userId).update({
        plan: "Premium",
        planAmount: 29,
        paymentId: razorpayPaymentId,
        orderId: orderCreationId,
        updatedAt: FieldValue.serverTimestamp(), // Use Admin Timestamp
        status: "Active"
    });

    return NextResponse.json({ message: "Success", isPro: true });

  } catch (error: any) {
    console.error("VERIFY ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}