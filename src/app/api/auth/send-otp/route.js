import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Otp from "@/models/Otp";
import { sendOtpSchema } from "@/lib/validators";
import { sendWhatsAppOtp, sendEmailOtp } from "@/lib/messaging";

export async function POST(request) {
  try {
    const body = await request.json();

    // Zod validation
    const validation = sendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { recipient, channel } = validation.data;
    await connectToDatabase();

    // 2-Minute (120s) Backend Rate-Limit Cooldown Check
    const existingOtp = await Otp.findOne({ recipient }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeDiffSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (timeDiffSeconds < 120) {
        const remainingSecs = Math.ceil(120 - timeDiffSeconds);
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${remainingSecs} seconds before requesting a new OTP.`,
            cooldownRemaining: remainingSecs
          },
          { status: 429 }
        );
      }
    }

    // Generate 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Remove previous OTPs for recipient
    await Otp.deleteMany({ recipient });

    // Store in Mongo with 10-min TTL
    await Otp.create({
      recipient,
      code: otpCode,
      channel,
      createdAt: new Date()
    });

    // Send via WhatsApp Cloud API or Resend
    let result;
    const isEmail = channel === "email" || recipient.includes("@");
    if (isEmail) {
      result = await sendEmailOtp(recipient, otpCode);
    } else {
      result = await sendWhatsAppOtp(recipient, otpCode);
    }

    return NextResponse.json({
      success: true,
      message: `OTP code successfully dispatched via ${isEmail ? "Resend Email" : "Meta WhatsApp API"}`,
      recipient,
      channel: isEmail ? "email" : "whatsapp",
      cooldownSeconds: 120,
      meta: result,
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
