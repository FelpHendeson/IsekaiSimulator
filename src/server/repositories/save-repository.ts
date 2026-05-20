import { connectMongo } from "../db/mongodb";
import { SaveModel } from "../models/save";
import type { GameStatePayload } from "../validation/save";

export async function upsertSave(gameState: GameStatePayload) {
  await connectMongo();

  return SaveModel.findOneAndUpdate(
    { saveId: gameState.saveId },
    { gameState },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
}

export async function findSave(saveId: string) {
  await connectMongo();

  return SaveModel.findOne({ saveId }).lean();
}

