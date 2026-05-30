import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
  user_id: string;
  email: string;
  role: string;
}

const ALG = "HS256";
const TOKEN_LIFETIME = "24h";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT with the given payload.
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_LIFETIME)
    .sign(getSecret());
}

/**
 * Verify and decode a JWT. Throws on invalid/expired tokens.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    user_id: payload.user_id as string,
    email: payload.email as string,
    role: payload.role as string,
  };
}
