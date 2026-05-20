import { z } from "zod";

const clockSchema = z.object({
  day: z.number().int().min(1),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  period: z.enum(["dawn", "morning", "afternoon", "evening", "night", "late_night"]),
});

const energySchema = z.object({
  stamina: z.number().min(0),
  maxStamina: z.number().positive(),
  fatigue: z.number().min(0).max(100),
  sleepDebt: z.number().min(0),
});

const playerSchema = z
  .object({
    name: z.string().min(1),
    level: z.number().int().min(1),
    xp: z.number().min(0),
    hp: z.number().min(0),
    maxHp: z.number().positive(),
    mana: z.number().min(0),
    maxMana: z.number().positive(),
    gold: z.number().min(0),
    stats: z.record(z.string(), z.number()),
    energy: energySchema,
  })
  .passthrough();

const trainingSessionSchema = z.object({
  id: z.string().min(1),
  trainingId: z.string().min(1),
  startedAtIso: z.string().datetime(),
  finishesAtIso: z.string().datetime(),
  worldTimeAdvanceMinutes: z.number().int().min(0),
  staminaCost: z.number().min(0),
});

export const gameStateSchema = z
  .object({
    saveId: z.string().min(1),
    currentLocationId: z.string().min(1),
    currentSceneId: z.string().optional(),
    clock: clockSchema,
    player: playerSchema,
    world: z.object({
      locations: z.record(z.string(), z.unknown()),
    }),
    inventory: z
      .object({
        itemIds: z.array(z.string()),
      })
      .passthrough(),
    quests: z.array(z.unknown()),
    flags: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])),
    achievements: z.array(z.string()),
    activeTrainingSessions: z.array(trainingSessionSchema),
    eventLog: z.array(z.unknown()),
  })
  .passthrough();

export type GameStatePayload = z.infer<typeof gameStateSchema>;

