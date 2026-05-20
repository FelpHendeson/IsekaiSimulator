import type { EnemyDefinition } from "../../game/types";

export const enemyDefinitions: EnemyDefinition[] = [
  {
    id: "shadow_wolf",
    name: "Lobo Sombrio",
    maxHp: 18,
    attack: 7,
    defense: 2,
    xpReward: 35,
    goldReward: 8,
  },
  {
    id: "training_dummy",
    name: "Boneco de Treino",
    maxHp: 10,
    attack: 1,
    defense: 0,
    xpReward: 5,
    goldReward: 0,
  },
];

