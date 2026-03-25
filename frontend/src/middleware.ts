import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "app_auth";

export function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // 未配置密码时跳过验证
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // 登录页本身不拦截
  if (pathname.startsWith("/login")) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE);
  if (cookie?.value === password) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
