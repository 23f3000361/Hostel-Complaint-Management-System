import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query } from "@/lib/db/pool";
import type { Department } from "@/lib/db/types";

export async function GET() {
  try {
    const departments = await query<Department>(
      "SELECT * FROM departments ORDER BY dept_name"
    );
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("[GET /api/departments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create departments" }, { status: 403 });
    }
    const body = await request.json();
    const { dept_name } = body;
    if (!dept_name) {
      return NextResponse.json({ error: "dept_name is required" }, { status: 400 });
    }
    const deptId = uuidv4();
    const rows = await query<Department>(
      "INSERT INTO departments (dept_id, dept_name) VALUES ($1, $2) RETURNING *",
      [deptId, dept_name]
    );
    return NextResponse.json({ message: "Department created", department: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/departments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
