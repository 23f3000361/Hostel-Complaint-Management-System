import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query, queryOne } from "@/lib/db/pool";
import type { Hostel } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ hostelId: string }>;
}

/**
 * GET /api/hostels/:hostelId
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { hostelId } = await context.params;

    const hostel = await queryOne<Hostel>(
      "SELECT * FROM hostels WHERE hostel_id = $1",
      [hostelId]
    );

    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ hostel });
  } catch (error) {
    console.error("[GET /api/hostels/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/hostels/:hostelId
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    if (auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update hostels" },
        { status: 403 }
      );
    }

    const { hostelId } = await context.params;
    const body = await request.json();

    const fields = ["hostel_name", "location"];
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const field of fields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${idx++}`);
        params.push(body[field]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    params.push(hostelId);
    const rows = await query<Hostel>(
      `UPDATE hostels SET ${setClauses.join(", ")} WHERE hostel_id = $${idx} RETURNING *`,
      params
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hostel updated", hostel: rows[0] });
  } catch (error) {
    console.error("[PATCH /api/hostels/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hostels/:hostelId
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    if (auth.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete hostels" },
        { status: 403 }
      );
    }

    const { hostelId } = await context.params;
    const rows = await query(
      "DELETE FROM hostels WHERE hostel_id = $1 RETURNING hostel_id",
      [hostelId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hostel deleted" });
  } catch (error) {
    console.error("[DELETE /api/hostels/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
