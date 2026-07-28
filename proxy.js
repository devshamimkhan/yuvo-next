import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const adminPath = "/admin/dashboard";
const customerPath = "/user/profile";
const authRedirectPath = "/auth/redirect";

function redirectTo(pathname, request) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }

    return redirectToLogin(request);
  }

  const isAdmin = token.role === "admin";

  if (
    pathname === authRedirectPath ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return redirectTo(isAdmin ? adminPath : customerPath, request);
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return redirectTo(customerPath, request);
  }

  if (pathname.startsWith("/user") && isAdmin) {
    return redirectTo(adminPath, request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/redirect",
    "/login",
    "/register",
    "/admin/:path*",
    "/user/:path*",
  ],
};
