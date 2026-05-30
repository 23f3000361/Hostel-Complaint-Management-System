import { NextRequest, NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail } from "@/lib/auth/email";
import { queryOne } from "@/lib/db/pool";
import type { User } from "@/lib/db/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    if (!isAllowedInstitutionEmail(email)) {
      return NextResponse.json(
        { error: ALLOWED_EMAIL_MESSAGE },
        { status: 400 }
      );
    }

    // ── Look up user by email ─────────────────────────────────────────
    const user = await queryOne<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Verify password ───────────────────────────────────────────────
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Issue JWT ─────────────────────────────────────────────────────
    const token = await signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel_id: user.hostel_id,
        room_number: user.room_number,
        tenure_since: user.tenure_since,
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
