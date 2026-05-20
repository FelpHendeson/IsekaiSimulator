import type { TrainingDefinition } from "../../game/types";

export const trainingDefinitions: TrainingDefinition[] = [
  {
    id: "strength_basics",
    name: "Treino de Forca",
    realDurationMinutes: 30,
    worldTimeAdvanceMinutes: 12 * 60,
    staminaCost: 60,
    fatigueGain: 18,
    goldCost: 20,
    rewards: [
      { type: "stat", stat: "strength", amount: 1 },
      { type: "stat", stat: "vitality", amount: 1 },
      { type: "maxHp", amount: 2 },
    ],
  },
  {
    id: "endurance_run",
    name: "Corrida de Resistencia",
    realDurationMinutes: 20,
    worldTimeAdvanceMinutes: 4 * 60,
    staminaCost: 35,
    fatigueGain: 12,
    rewards: [
      { type: "stat", stat: "agility", amount: 1 },
      { type: "maxStamina", amount: 3 },
    ],
  },
  {
    id: "arcane_meditation",
    name: "Meditacao Arcana",
    realDurationMinutes: 25,
    worldTimeAdvanceMinutes: 6 * 60,
    staminaCost: 15,
    fatigueGain: 8,
    rewards: [
      { type: "stat", stat: "wisdom", amount: 1 },
      { type: "stat", stat: "intelligence", amount: 1 },
    ],
  },
];

