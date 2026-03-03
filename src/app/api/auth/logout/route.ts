import { NextResponse } from "next/server";

function clearSessionCookie(res: NextResponse) {
  res.cookies.set("nlvpn_session", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
  });
  return res;
}

// GET /api/auth/logout — clears cookie and redirects (used by server components)
export async function GET(req: Request) {
  const { origin } = new URL(req.url);
  return clearSessionCookie(NextResponse.redirect(`${origin}/access`));
}

// POST /api/auth/logout — clears cookie, returns JSON (used by client-side logout)
export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
