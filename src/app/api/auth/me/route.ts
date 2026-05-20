import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../server/auth/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json({ error: "Erro inesperado ao consultar sessao." }, { status: 500 });
  }
}

