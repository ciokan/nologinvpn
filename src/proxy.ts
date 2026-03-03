import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PROTECTED_PATHS = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/access";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
