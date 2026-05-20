import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { findSave, upsertSave } from "../../../server/repositories/save-repository";
import { gameStateSchema } from "../../../server/validation/save";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const saveId = request.nextUrl.searchParams.get("saveId") ?? "local-demo-save";
    const save = await findSave(saveId);

    if (!save) {
      return NextResponse.json({ save: null }, { status: 404 });
    }

    return NextResponse.json({ save });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const gameState = gameStateSchema.parse(payload);
    const save = await upsertSave(gameState);

    return NextResponse.json({ save });
  } catch (error) {
    return handleApiError(error);
  }
}

function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Payload de save invalido.",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error && error.message.includes("MONGODB_URI")) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "Erro inesperado ao acessar o save.",
    },
    { status: 500 },
  );
}

