import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Seller from "@/models/Seller";
import { demoSeller } from "@/lib/seller-demo-data";

export async function GET(request) {
  try {
    await connectToDatabase();
    let sellers = await Seller.find({}).lean();
    if (!sellers || sellers.length === 0) {
      sellers = [demoSeller];
    }
    return NextResponse.json({ success: true, count: sellers.length, sellers });
  } catch (err) {
    console.error("GET Sellers Error:", err);
    return NextResponse.json({ success: true, count: 1, sellers: [demoSeller] });
  }
}
