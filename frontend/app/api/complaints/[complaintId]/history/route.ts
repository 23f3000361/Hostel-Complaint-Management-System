import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query } from "@/lib/db/pool";
import type { ComplaintHistory } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ complaintId: string }>;
}

/**
 * GET /api/complaints/:complaintId/history
 * List all history entries for a complaint, newest first.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { complaintId } = await context.params;

    const history = await query<ComplaintHistory & { user_name: string }>(
      `SELECT ch.*, u.name AS user_name
       FROM complaint_history ch
       LEFT JOIN users u ON ch.user_id = u.user_id
       WHERE ch.complaint_id = $1
       ORDER BY ch.timestamp DESC`,
      [complaintId]
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/complaints/:id/history]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints/:complaintId/history
 * Add a history entry. Requires authentication.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { complaintId } = await context.params;
    const body = await request.json();
    const { action, remarks } = body;

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    const historyId = uuidv4();

    const rows = await query<ComplaintHistory>(
      `INSERT INTO complaint_history (history_id, complaint_id, user_id, action, remarks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [historyId, complaintId, auth.user.user_id, action, remarks ?? ""]
    );

    return NextResponse.json(
      { message: "History entry added", history: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/complaints/:id/history]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
