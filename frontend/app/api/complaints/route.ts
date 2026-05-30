import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query, queryOne } from "@/lib/db/pool";
import type { Complaint } from "@/lib/db/types";

/**
 * GET /api/complaints
 * List complaints with optional filters: status, hostel_id, urgency_id, filed_by_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const hostelId = searchParams.get("hostel_id");
    const urgencyId = searchParams.get("urgency_id");
    const filedById = searchParams.get("filed_by_id");

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`c.status = $${idx++}`);
      params.push(status);
    }
    if (hostelId) {
      conditions.push(`c.hostel_id = $${idx++}`);
      params.push(hostelId);
    }
    if (urgencyId) {
      conditions.push(`c.urgency_id = $${idx++}`);
      params.push(urgencyId);
    }
    if (filedById) {
      conditions.push(`c.filed_by_id = $${idx++}`);
      params.push(filedById);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const complaints = await query<Complaint & { media: unknown[] }>(
      `SELECT c.*,
              u.name   AS filed_by_name,
              h.hostel_name,
              ul.label AS urgency_label,
              d.dept_name AS assigned_dept_name,
              COALESCE(
                json_agg(cm.*) FILTER (WHERE cm.media_id IS NOT NULL),
                '[]'::json
              ) AS media
       FROM complaints c
       LEFT JOIN users u           ON c.filed_by_id      = u.user_id
       LEFT JOIN hostels h         ON c.hostel_id        = h.hostel_id
       LEFT JOIN urgency_levels ul ON c.urgency_id       = ul.urgency_id
       LEFT JOIN departments d     ON c.assigned_dept_id = d.dept_id
       LEFT JOIN complaint_media cm ON c.complaint_id     = cm.complaint_id
       ${where}
       GROUP BY c.complaint_id, u.name, h.hostel_name, ul.label, d.dept_name
       ORDER BY c.created_at DESC`,
      params
    );

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("[GET /api/complaints]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints
 * Create a new complaint. Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { hostel_id, room_number, title, description, urgency_id, assigned_dept_id } = body;

    if (!hostel_id || !room_number || !title || !urgency_id) {
      return NextResponse.json(
        { error: "hostel_id, room_number, title, and urgency_id are required" },
        { status: 400 }
      );
    }

    // Calculate escalation deadline from urgency level
    const urgency = await queryOne<{ escalation_hours: number }>(
      "SELECT escalation_hours FROM urgency_levels WHERE urgency_id = $1",
      [urgency_id]
    );

    if (!urgency) {
      return NextResponse.json(
        { error: "Invalid urgency_id" },
        { status: 400 }
      );
    }

    const complaintId = uuidv4();
    const now = new Date();
    const deadline = new Date(now.getTime() + urgency.escalation_hours * 60 * 60 * 1000);

    const rows = await query<Complaint>(
      `INSERT INTO complaints
         (complaint_id, filed_by_id, hostel_id, room_number, title, description,
          urgency_id, status, is_escalated, created_at, escalation_deadline, assigned_dept_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'filed', false, $8, $9, $10)
       RETURNING *`,
      [
        complaintId,
        auth.user.user_id,
        hostel_id,
        room_number,
        title,
        description ?? "",
        urgency_id,
        now.toISOString(),
        deadline.toISOString(),
        assigned_dept_id ?? null,
      ]
    );

    // Also create the initial history entry
    await query(
      `INSERT INTO complaint_history (history_id, complaint_id, user_id, action, remarks)
       VALUES ($1, $2, $3, 'filed', 'Complaint created')`,
      [uuidv4(), complaintId, auth.user.user_id]
    );

    return NextResponse.json(
      { message: "Complaint created", complaint: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/complaints]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
