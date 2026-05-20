import { locationDefinitions } from "../../content/world/locations";
import { createClock } from "../time/clock";
import type { GameState } from "../types";

export function createInitialGameState(): GameState {
  return {
    saveId: "local-demo-save",
    currentLocationId: "first_village",
    currentSceneId: undefined,
    clock: createClock(1, 7, 30),
    player: {
      name: "Reencarnado",
      level: 1,
      xp: 0,
      hp: 30,
      maxHp: 30,
      mana: 12,
      maxMana: 12,
      gold: 35,
      stats: {
        strength: 4,
        agility: 3,
        vitality: 4,
        intelligence: 3,
        wisdom: 2,
        charisma: 2,
        luck: 1,
      },
      energy: {
        stamina: 80,
        maxStamina: 80,
        fatigue: 0,
        sleepDebt: 0,
      },
    },
    world: {
      locations: locationDefinitions,
    },
    inventory: {
      itemIds: ["small_potion"],
    },
    quests: [],
    flags: {},
    achievements: [],
    activeTrainingSessions: [],
    eventLog: [
      {
        id: "intro-log",
        createdAtIso: new Date(0).toISOString(),
        message: "Voce desperta em um mundo que nao reconhece.",
      },
    ],
  };
}
