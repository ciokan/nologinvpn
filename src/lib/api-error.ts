import { NextResponse } from "next/server";

/**
 * Wraps an API route handler in a try/catch.
 * On any unhandled error: logs internally, returns a safe 500 with no details.
 */
export function withErrorHandler(
  handler: (req: Request, ctx: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error("[api]", req.method, new URL(req.url).pathname, err);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  };
}

/** Typed convenience for route handlers that use NextRequest */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
