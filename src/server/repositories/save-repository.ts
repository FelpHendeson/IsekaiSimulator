import { connectMongo } from "../db/mongodb";
import { SaveModel } from "../models/save";
import type { GameStatePayload } from "../validation/save";

export async function upsertSave(userId: string, gameState: GameStatePayload) {
  await connectMongo();

  return SaveModel.findOneAndUpdate(
    { userId, saveId: gameState.saveId },
    { userId, saveId: gameState.saveId, gameState },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
}

export async function findSave(userId: string, saveId: string) {
  await connectMongo();

  return SaveModel.findOne({ userId, saveId }).lean();
}
