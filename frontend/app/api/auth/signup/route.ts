import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { ALLOWED_EMAIL_MESSAGE, isAllowedInstitutionEmail } from "@/lib/auth/email";
import { query, queryOne } from "@/lib/db/pool";
import type { User } from "@/lib/db/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, hostel_id, room_number, tenure_since } = body;

    // ── Validate required fields ──────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email, and password are required" },
        { status: 400 }
      );
    }

    if (!isAllowedInstitutionEmail(email)) {
      return NextResponse.json(
        { error: ALLOWED_EMAIL_MESSAGE },
        { status: 400 }
      );
    }

    const inputRole = role === "dsw" ? "admin" : role;
    const validRoles = ["student", "warden", "admin", "maintenance"];
    const userRole = inputRole && validRoles.includes(inputRole) ? inputRole : "student";

    // ── Check for duplicate email ─────────────────────────────────────
    const existing = await queryOne<User>(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create the user ───────────────────────────────────────────────
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    await query(
      `INSERT INTO users (user_id, name, email, password_hash, role, hostel_id, room_number, tenure_since)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, name, email, passwordHash, userRole, hostel_id ?? null, room_number ?? null, tenure_since ?? null]
    );

    // ── Issue JWT ─────────────────────────────────────────────────────
    const token = await signToken({
      user_id: userId,
      email,
      role: userRole,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        token,
        user: { user_id: userId, name, email, role: userRole, hostel_id: hostel_id ?? null, room_number: room_number ?? null, tenure_since: tenure_since ?? null },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/signup]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
