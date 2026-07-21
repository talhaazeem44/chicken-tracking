import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/session";

const adminRoutes = ["/admin"];
const salesRoutes = ["/sales"];
const publicRoutes = ["/login"];

// Sessions from before this app moved to MongoDB (or whose account was
// since deleted) carry a userId that isn't a Mongo ObjectId. Treat those as
// logged out and clear the cookie here, since middleware is the one place
// allowed to mutate cookies outside a Server Action/Route Handler.
function isValidObjectId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isSalesRoute = salesRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const cookie = req.cookies.get("session")?.value;
  const decoded = await decryptSession(cookie);
  const session = decoded && isValidObjectId(decoded.userId) ? decoded : null;

  if (cookie && !session) {
    // Stale/invalid cookie: clear it on every response so it can't keep
    // bouncing the user between routes.
    if ((isAdminRoute || isSalesRoute) && !isPublicRoute) {
      const res = NextResponse.redirect(new URL("/login", req.nextUrl));
      res.cookies.delete("session");
      return res;
    }
    const res = NextResponse.next();
    res.cookies.delete("session");
    return res;
  }

  if ((isAdminRoute || isSalesRoute) && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAdminRoute && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/sales", req.nextUrl));
  }

  if (isSalesRoute && session?.role !== "sales") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(
      new URL(session.role === "admin" ? "/admin" : "/sales", req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
