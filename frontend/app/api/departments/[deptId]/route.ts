import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/auth/middleware";
import { query, queryOne } from "@/lib/db/pool";
import type { Department } from "@/lib/db/types";

interface RouteContext {
  params: Promise<{ deptId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { deptId } = await context.params;
    const dept = await queryOne<Department>(
      "SELECT * FROM departments WHERE dept_id = $1",
      [deptId]
    );
    if (!dept) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    return NextResponse.json({ department: dept });
  } catch (error) {
    console.error("[GET /api/departments/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update departments" }, { status: 403 });
    }
    const { deptId } = await context.params;
    const body = await request.json();
    if (!body.dept_name) {
      return NextResponse.json({ error: "dept_name is required" }, { status: 400 });
    }
    const rows = await query<Department>(
      "UPDATE departments SET dept_name = $1 WHERE dept_id = $2 RETURNING *",
      [body.dept_name, deptId]
    );
    if (rows.length === 0) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    return NextResponse.json({ message: "Department updated", department: rows[0] });
  } catch (error) {
    console.error("[PATCH /api/departments/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete departments" }, { status: 403 });
    }
    const { deptId } = await context.params;
    const rows = await query(
      "DELETE FROM departments WHERE dept_id = $1 RETURNING dept_id",
      [deptId]
    );
    if (rows.length === 0) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    return NextResponse.json({ message: "Department deleted" });
  } catch (error) {
    console.error("[DELETE /api/departments/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
