import { NextRequest, NextResponse } from "next/server";

import { verifyToken, type JwtPayload } from "./jwt";

export interface AuthResult {
  success: true;
  user: JwtPayload;
}

interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Extract and validate the Bearer token from an incoming request.
 *
 * Usage inside a route handler:
 * ```ts
 * const auth = await authenticateRequest(request);
 * if (!auth.success) return auth.response;
 * const { user } = auth;
 * ```
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const header = request.headers.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Missing or malformed Authorization header" },
        { status: 401 }
      ),
    };
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const user = await verifyToken(token);
    return { success: true, user };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}
