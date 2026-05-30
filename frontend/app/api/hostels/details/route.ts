import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db/pool";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostel_id");

    if (!hostelId) {
      return NextResponse.json({ error: "hostel_id is required" }, { status: 400 });
    }

    const hostel = await queryOne<{ hostel_name: string; location: string }>(
      "SELECT hostel_name, location FROM hostels WHERE hostel_id = $1",
      [hostelId]
    );

    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    const wardens = await query<{ name: string }>(
      "SELECT name FROM users WHERE role = 'warden' AND hostel_id = $1",
      [hostelId]
    );

    const wardenNames = wardens.map(w => w.name).join(", ") || "None assigned";

    return NextResponse.json({
      hostel_name: hostel.hostel_name,
      location: hostel.location,
      wardens: wardenNames
    });
  } catch (error) {
    console.error("[GET /api/hostels/details]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
