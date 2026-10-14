import { NextResponse } from "next/server";
import { INITIAL_DISTRICTS } from "@/data/mockData";

export async function GET(request) {
  return NextResponse.json({ success: true, count: INITIAL_DISTRICTS.length, districts: INITIAL_DISTRICTS });
}
