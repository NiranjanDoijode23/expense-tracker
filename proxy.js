import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (nextAuthToken) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-expense/:path*",
    "/api/expense/:path*",
    "/api/category/:path*", 
    "/api/budget/:path*",
    "/profile/:path",
  ],
};