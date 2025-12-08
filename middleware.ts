import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("admin-auth")?.value;
  const { pathname } = req.nextUrl;

  // Allow login page and API login
  const isLoginPath = pathname.startsWith("/login") || pathname.startsWith("/api/admin/login");

  // Protect admin pages
  if (!auth && pathname.startsWith("/admin") && !isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect mutating admin APIs (POST/PATCH/DELETE)
  const isMutating = ["POST", "PATCH", "DELETE"].includes(req.method);
  const protectedApi = pathname.startsWith("/api/whatsapp") ||
    pathname.startsWith("/api/dice-reward") ||
    pathname.startsWith("/api/admin/whatsapp");

  if (isMutating && protectedApi && !auth && !isLoginPath) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
