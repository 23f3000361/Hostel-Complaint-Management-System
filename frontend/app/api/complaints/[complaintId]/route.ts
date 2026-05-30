import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query, queryOne } from "@/lib/db/pool";
import type { Complaint } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ complaintId: string }>;
}

/**
 * GET /api/complaints/:complaintId
 * Retrieve a single complaint with all related data.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { complaintId } = await context.params;

    const complaint = await queryOne(
      `SELECT c.*,
              u.name   AS filed_by_name,
              u.email  AS filed_by_email,
              h.hostel_name,
              h.location AS hostel_location,
              ul.label AS urgency_label,
              ul.escalation_hours,
              d.dept_name AS assigned_dept_name
       FROM complaints c
       LEFT JOIN users u           ON c.filed_by_id      = u.user_id
       LEFT JOIN hostels h         ON c.hostel_id        = h.hostel_id
       LEFT JOIN urgency_levels ul ON c.urgency_id       = ul.urgency_id
       LEFT JOIN departments d     ON c.assigned_dept_id = d.dept_id
       WHERE c.complaint_id = $1`,
      [complaintId]
    );

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Fetch related media
    const media = await query(
      "SELECT * FROM complaint_media WHERE complaint_id = $1",
      [complaintId]
    );

    // Fetch history
    const history = await query(
      `SELECT ch.*, u.name AS user_name
       FROM complaint_history ch
       LEFT JOIN users u ON ch.user_id = u.user_id
       WHERE ch.complaint_id = $1
       ORDER BY ch.timestamp DESC`,
      [complaintId]
    );

    return NextResponse.json({ complaint, media, history });
  } catch (error) {
    console.error("[GET /api/complaints/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/complaints/:complaintId
 * Update complaint fields (status, assigned_dept_id, is_escalated, resolved_at).
 * Requires authentication.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { complaintId } = await context.params;
    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = ["status", "assigned_dept_id", "is_escalated", "resolved_at", "urgency_id"];
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const field of allowedFields) {
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

    params.push(complaintId);
    const rows = await query<Complaint>(
      `UPDATE complaints SET ${setClauses.join(", ")} WHERE complaint_id = $${idx} RETURNING *`,
      params
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Log the update to history
    const action = body.status ? `status_changed_to_${body.status}` : "updated";
    const remarks = body.remarks ?? "Complaint updated";

    await query(
      `INSERT INTO complaint_history (history_id, complaint_id, user_id, action, remarks)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4)`,
      [complaintId, auth.user.user_id, action, remarks]
    );

    return NextResponse.json({ message: "Complaint updated", complaint: rows[0] });
  } catch (error) {
    console.error("[PATCH /api/complaints/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/complaints/:complaintId
 * Delete a complaint. Requires admin role.
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
        { error: "Only admins can delete complaints" },
        { status: 403 }
      );
    }

    const { complaintId } = await context.params;

    const rows = await query(
      "DELETE FROM complaints WHERE complaint_id = $1 RETURNING complaint_id",
      [complaintId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Complaint deleted" });
  } catch (error) {
    console.error("[DELETE /api/complaints/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
