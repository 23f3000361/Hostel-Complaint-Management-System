import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query } from "@/lib/db/pool";
import type { UrgencyLevel } from "@/lib/db/types";

export async function GET() {
  try {
    const levels = await query<UrgencyLevel>(
      "SELECT * FROM urgency_levels ORDER BY escalation_hours ASC"
    );
    return NextResponse.json({ urgency_levels: levels });
  } catch (error) {
    console.error("[GET /api/urgency-levels]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create urgency levels" }, { status: 403 });
    }
    const body = await request.json();
    const { label, escalation_hours } = body;
    if (!label || escalation_hours === undefined) {
      return NextResponse.json({ error: "label and escalation_hours are required" }, { status: 400 });
    }
    const urgencyId = uuidv4();
    const rows = await query<UrgencyLevel>(
      "INSERT INTO urgency_levels (urgency_id, label, escalation_hours) VALUES ($1, $2, $3) RETURNING *",
      [urgencyId, label, escalation_hours]
    );
    return NextResponse.json({ message: "Urgency level created", urgency_level: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/urgency-levels]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
