import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Return from "@/models/Return";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const returns = await Return.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    const targetId = id || body.id;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "Return ID required for update" }, { status: 400 });
    }

    const updated = await Return.findOneAndUpdate({ id: targetId }, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Return claim not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Return claim status updated successfully in MongoDB",
      returnItem: updated,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
