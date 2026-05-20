import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "../../../server/auth/session";
import { findSave, upsertSave } from "../../../server/repositories/save-repository";
import { gameStateSchema } from "../../../server/validation/save";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Login necessario para carregar saves." }, { status: 401 });
    }

    const saveId = request.nextUrl.searchParams.get("saveId") ?? "local-demo-save";
    const save = await findSave(user.id, saveId);

    if (!save) {
      return NextResponse.json({ save: null }, { status: 404 });
    }

    return NextResponse.json({ save: serializeSave(save) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Login necessario para salvar." }, { status: 401 });
    }

    const payload = await request.json();
    const gameState = gameStateSchema.parse(payload);
    const save = await upsertSave(user.id, gameState);

    return NextResponse.json({ save: serializeSave(save) });
  } catch (error) {
    return handleApiError(error);
  }
}

function serializeSave(save: unknown) {
  const typedSave = save as {
    saveId: string;
    gameState: unknown;
    createdAt?: Date;
    updatedAt?: Date;
  };

  return {
    saveId: typedSave.saveId,
    gameState: typedSave.gameState,
    createdAt: typedSave.createdAt,
    updatedAt: typedSave.updatedAt,
  };
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
