import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import { getAuthSeller } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = getAuthSeller(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let seller = null;
    let user = null;
    
    if (auth.sellerId) {
      seller = await Seller.findOne({ id: auth.sellerId });
    }
    
    if (auth.userId) {
      user = await User.findOne({ id: auth.userId });
    }

    if (!seller && !user) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, seller, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = getAuthSeller(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    if (auth.userId && body.user) {
      const updatedUser = await User.findOneAndUpdate(
        { id: auth.userId },
        { $set: body.user },
        { new: true }
      );
      return NextResponse.json({ success: true, user: updatedUser });
    }
    
    if (auth.sellerId && body.seller) {
      const updatedSeller = await Seller.findOneAndUpdate(
        { id: auth.sellerId },
        { $set: body.seller },
        { new: true }
      );
      return NextResponse.json({ success: true, seller: updatedSeller });
    }

    return NextResponse.json({ success: false, error: "Invalid payload or user not found" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
