import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../server/auth/session";
import { deleteSession } from "../../../../server/repositories/auth-repository";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}

