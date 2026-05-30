import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    // 2. Read FormData
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (10MB limit)
    const limit = 10 * 1024 * 1024;
    if (file.size > limit) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Get file details
    const originalName = (file as any).name || "file";
    const extension = path.extname(originalName).toLowerCase().replace(".", "");

    // Validate extension
    const allowedExtensions = ["png", "jpg", "jpeg", "mp4"];
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PNG, JPG, JPEG, MP4" }, { status: 400 });
    }

    // Create unique, safe filename using UUID to prevent naming collision and path injection
    const safeFilename = `${uuidv4()}.${extension}`;

    // Ensure upload directory exists in public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Path traversal prevention: enforce that safeFilename does not escape uploadDir
    const filePath = path.join(uploadDir, path.basename(safeFilename));
    
    // Resolve absolute path and verify boundary (enforce trailing slash check on parent)
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);
    if (!resolvedPath.startsWith(resolvedUploadDir + path.sep)) {
      return NextResponse.json({ error: "Path traversal detected" }, { status: 400 });
    }

    // Convert file/Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write file to local disk
    await fs.writeFile(resolvedPath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${safeFilename}`;

    // TODO(security): Store uploaded files outside the web root and serve through an authenticated endpoint in production.
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
