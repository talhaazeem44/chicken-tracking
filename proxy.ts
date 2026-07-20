import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/session";

const adminRoutes = ["/admin"];
const salesRoutes = ["/sales"];
const publicRoutes = ["/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isSalesRoute = salesRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const cookie = req.cookies.get("session")?.value;
  const session = await decryptSession(cookie);

  if ((isAdminRoute || isSalesRoute) && !session?.userId) {
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
