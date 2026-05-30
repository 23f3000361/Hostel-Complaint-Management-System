import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/auth/middleware";
import { queryOne } from "@/lib/db/pool";
import type { PublicUser } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const user = await queryOne<PublicUser>(
      "SELECT user_id, name, email, role, hostel_id, room_number, tenure_since FROM users WHERE user_id = $1",
      [auth.user.user_id]
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
