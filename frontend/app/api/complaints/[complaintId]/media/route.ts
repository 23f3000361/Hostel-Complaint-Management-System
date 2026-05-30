import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query } from "@/lib/db/pool";
import type { ComplaintMedia } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ complaintId: string }>;
}

/**
 * GET /api/complaints/:complaintId/media
 * List all media attachments for a complaint.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { complaintId } = await context.params;

    const media = await query<ComplaintMedia>(
      "SELECT * FROM complaint_media WHERE complaint_id = $1 ORDER BY media_id",
      [complaintId]
    );

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[GET /api/complaints/:id/media]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints/:complaintId/media
 * Add a media entry to a complaint. Requires authentication.
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
    const { media_url, media_type, upload_stage } = body;

    if (!media_url) {
      return NextResponse.json(
        { error: "media_url is required" },
        { status: 400 }
      );
    }

    const mediaId = uuidv4();

    // Fetch uploader's name from database
    const userResult = await query<{ name: string }>(
      "SELECT name FROM users WHERE user_id = $1",
      [auth.user.user_id]
    );
    const uploaderName = userResult[0]?.name || "Anonymous";

    const rows = await query<ComplaintMedia>(
      `INSERT INTO complaint_media (media_id, complaint_id, media_url, media_type, upload_stage, uploaded_by_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [mediaId, complaintId, media_url, media_type ?? "image", upload_stage ?? "initial", uploaderName]
    );

    return NextResponse.json(
      { message: "Media added", media: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/complaints/:id/media]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
