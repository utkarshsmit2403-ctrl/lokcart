import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";

export async function GET(request) {
  const db = getDb();
  return NextResponse.json({ success: true, verifications: db.verifications || [] });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    
    // Add verification or update existing
    const verifications = db.verifications || [];
    
    // Handle approve/reject via action
    if (body.action === 'approve') {
      const idx = verifications.findIndex(v => v.id === body.id);
      if (idx !== -1) verifications[idx].status = 'approved';
    } else if (body.action === 'reject') {
      const idx = verifications.findIndex(v => v.id === body.id);
      if (idx !== -1) verifications[idx].status = 'rejected';
    } else {
      verifications.unshift({
        id: `ver-${Date.now()}`,
        status: 'pending',
        ...body
      });
    }
    
    db.verifications = verifications;
    saveDb(db);
    
    return NextResponse.json({ success: true, verifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
