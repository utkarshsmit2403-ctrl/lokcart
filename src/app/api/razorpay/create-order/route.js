import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount." },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.RAZOR_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_SyLCpyzPNMwHdX";

    const razorpay = getRazorpayInstance();

    let order = null;
    if (razorpay) {
      try {
        order = await razorpay.orders.create({
          amount: Math.round(numericAmount * 100),
          currency: "INR",
          receipt: receipt || `lokkart_${Date.now()}`,
          notes: notes || {},
        });
      } catch (err) {
        console.warn("Razorpay API order creation notice:", err.error?.description || err.message);
      }
    }

    return NextResponse.json({
      success: true,
      order: order,
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      key: keyId,
      mode: order && order.id ? "order_api" : "standard_checkout",
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error.message);
    const fallbackKey =
      process.env.RAZORPAY_KEY_ID ||
      process.env.RAZOR_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_SyLCpyzPNMwHdX";
    return NextResponse.json({
      success: true,
      order: null,
      key: fallbackKey,
      mode: "standard_checkout",
    });
  }
}
