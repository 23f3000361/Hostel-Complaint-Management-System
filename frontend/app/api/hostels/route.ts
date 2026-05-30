import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query } from "@/lib/db/pool";
import type { Hostel } from "@/lib/db/types";

/**
 * GET /api/hostels
 * List all hostels.
 */
export async function GET() {
  try {
    const hostels = await query<Hostel>(
      "SELECT * FROM hostels ORDER BY hostel_name"
    );
    return NextResponse.json({ hostels });
  } catch (error) {
    console.error("[GET /api/hostels]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hostels
 * Create a new hostel. Requires admin role.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    if (auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create hostels" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { hostel_name, location } = body;

    if (!hostel_name || !location) {
      return NextResponse.json(
        { error: "hostel_name and location are required" },
        { status: 400 }
      );
    }

    const hostelId = uuidv4();
    const rows = await query<Hostel>(
      `INSERT INTO hostels (hostel_id, hostel_name, location)
       VALUES ($1, $2, $3) RETURNING *`,
      [hostelId, hostel_name, location]
    );

    return NextResponse.json(
      { message: "Hostel created", hostel: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/hostels]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
