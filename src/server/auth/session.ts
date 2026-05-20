import type { NextRequest } from "next/server";
import { findUserBySessionToken } from "../repositories/auth-repository";

export const SESSION_COOKIE_NAME = "isekai_session";

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return findUserBySessionToken(token);
}

