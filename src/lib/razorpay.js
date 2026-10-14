import Razorpay from "razorpay";

let cachedInstance = null;

export function getRazorpayInstance() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.RAZOR_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZOR_KEY_SECRET;

  if (!keyId || !keySecret || keyId === "YOUR_RAZORPAY_KEY_ID") {
    return null;
  }

  if (!cachedInstance) {
    cachedInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return cachedInstance;
}
