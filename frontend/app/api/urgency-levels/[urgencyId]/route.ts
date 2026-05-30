import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query, queryOne } from "@/lib/db/pool";
import type { UrgencyLevel } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ urgencyId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { urgencyId } = await context.params;
    const level = await queryOne<UrgencyLevel>(
      "SELECT * FROM urgency_levels WHERE urgency_id = $1",
      [urgencyId]
    );
    if (!level) return NextResponse.json({ error: "Urgency level not found" }, { status: 404 });
    return NextResponse.json({ urgency_level: level });
  } catch (error) {
    console.error("[GET /api/urgency-levels/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update urgency levels" }, { status: 403 });
    }
    const { urgencyId } = await context.params;
    const body = await request.json();
    const fields = ["label", "escalation_hours"];
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
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    params.push(urgencyId);
    const rows = await query<UrgencyLevel>(
      `UPDATE urgency_levels SET ${setClauses.join(", ")} WHERE urgency_id = $${idx} RETURNING *`,
      params
    );
    if (rows.length === 0) return NextResponse.json({ error: "Urgency level not found" }, { status: 404 });
    return NextResponse.json({ message: "Urgency level updated", urgency_level: rows[0] });
  } catch (error) {
    console.error("[PATCH /api/urgency-levels/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete urgency levels" }, { status: 403 });
    }
    const { urgencyId } = await context.params;
    const rows = await query(
      "DELETE FROM urgency_levels WHERE urgency_id = $1 RETURNING urgency_id",
      [urgencyId]
    );
    if (rows.length === 0) return NextResponse.json({ error: "Urgency level not found" }, { status: 404 });
    return NextResponse.json({ message: "Urgency level deleted" });
  } catch (error) {
    console.error("[DELETE /api/urgency-levels/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
