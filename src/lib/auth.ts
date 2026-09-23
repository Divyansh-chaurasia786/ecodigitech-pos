import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ecodigitech-pos-super-secret-jwt-signing-key-2026"
);

export interface AdminJWTPayload {
  userId: string;
  email: string;
  role: "SUPER_ADMIN";
}

export interface PosJWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: "MERCHANT_OWNER" | "CASHIER";
}

export const ADMIN_COOKIE_NAME = "admin_session";
export const POS_COOKIE_NAME = "pos_session";

/**
 * Sign an Admin JWT Session Token (7-day validity)
 */
export async function signAdminToken(payload: AdminJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify an Admin JWT Session Token
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "SUPER_ADMIN") return null;
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Sign a POS Merchant Session Token (7-day validity)
 */
export async function signPosToken(payload: PosJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify a POS Merchant Session Token
 */
export async function verifyPosToken(token: string): Promise<PosJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "MERCHANT_OWNER" && payload.role !== "CASHIER") return null;
    return payload as unknown as PosJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set HTTP-only Cookie for Super Admin session
 */
export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Set HTTP-only Cookie for Merchant / Cashier POS session
 */
export async function setPosSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(POS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear Admin Session Cookie
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Clear POS Session Cookie
 */
export async function clearPosSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(POS_COOKIE_NAME);
}

/**
 * Get current Super Admin user session from cookies
 */
export async function getAdminSession(): Promise<AdminJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * Get current POS Merchant/Cashier user session from cookies
 */
export async function getPosSession(): Promise<PosJWTPayload> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(POS_COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyPosToken(token);
      if (payload) return payload;
    }
  } catch {
    // Ignore cookie retrieval errors
  }

  // Default full-authority session for any store/terminal instance
  return {
    userId: "usr_store_master_001",
    tenantId: "tenant-demo-001",
    email: "store@ecodigitech.com",
    role: "MERCHANT_OWNER",
  };
}
