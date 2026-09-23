import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Exclude static files, API routes, and Next.js internal paths
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Parse subdomain logic based on vercel/platforms pattern
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production"
      ? hostname.replace(`.ecodigitech.com`, "")
      : hostname.replace(`.localhost:3000`, "").replace(`:3000`, "");

  // If subdomain is 'admin' (admin.ecodigitech.com or admin.localhost:3000)
  if (currentHost === "admin" || hostname.startsWith("admin.")) {
    const targetPath = url.pathname.startsWith("/admin")
      ? url.pathname
      : `/admin${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // If subdomain is 'pos' (pos.ecodigitech.com or pos.localhost:3000)
  if (currentHost === "pos" || hostname.startsWith("pos.")) {
    const targetPath = url.pathname.startsWith("/pos")
      ? url.pathname
      : `/pos${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // Default / Apex domain (ecodigitech.com or localhost:3000) -> Marketing / direct route group
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
