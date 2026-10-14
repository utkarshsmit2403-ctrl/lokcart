import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Seller from "@/models/Seller";
import { registerSellerSchema } from "@/lib/validators";
import { signJwtToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = registerSellerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const details = validation.data;
    await connectToDatabase();

    const existing = await Seller.findOne({ phone: details.phone });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A seller account already exists with this phone number." },
        { status: 400 }
      );
    }

    const sellerId = `seller-${Date.now()}`;
    const newSeller = await Seller.create({
      id: sellerId,
      name: details.businessName,
      artisan: details.artisanName,
      phone: details.phone,
      email: details.email || `${details.phone}@lokkart.in`,
      district: details.district,
      state: details.state,
      odopId: details.odopId || `ODOP-${details.district.slice(0, 3).toUpperCase()}-01`,
      giTag: "GI Verified",
      password: details.password || "seller123",
      gstin: details.gstin,
      bankDetails: {
        accountName: details.businessName,
        bankName: details.bankName || "State Bank of India",
        accountNumber: details.accountNumber || "389201948291",
        ifscCode: details.ifscCode || "SBIN0001482",
        upiId: details.upiId || `${details.phone}@upi`,
        verificationStatus: "Verified",
      },
    });

    const token = signJwtToken({
      sellerId: newSeller.id,
      name: newSeller.name,
      phone: newSeller.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: "Seller account registered successfully",
      token,
      seller: newSeller,
    }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register Seller Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
