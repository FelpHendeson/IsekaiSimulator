import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { SESSION_COOKIE_NAME } from "../../../../server/auth/session";
import {
  AuthError,
  createSession,
  registerUser,
} from "../../../../server/repositories/auth-repository";
import { authCredentialsSchema } from "../../../../server/validation/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const credentials = authCredentialsSchema.parse(await request.json());
    const user = await registerUser(credentials);
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    return handleAuthError(error);
  }
}

function handleAuthError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Credenciais invalidas.", issues: error.issues }, { status: 400 });
  }

  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error && error.message.includes("MONGODB_URI")) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ error: "Erro inesperado ao criar usuario." }, { status: 500 });
}

