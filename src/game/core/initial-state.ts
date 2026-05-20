import { createClock } from "../time/clock";
import type { GameState } from "../types";

export function createInitialGameState(): GameState {
  return {
    saveId: "local-demo-save",
    currentLocationId: "first_village",
    currentSceneId: "reincarnation_intro",
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
      locations: {
        first_village: {
          id: "first_village",
          name: "Vila de Elaria",
          type: "village",
          dangerLevel: 1,
          dangerByTime: {
            evening: 1,
            night: 2,
            late_night: 3,
          },
          connectedLocations: ["shadow_woods"],
          npcIds: ["hooded_mentor", "village_blacksmith"],
          eventPoolIds: ["village_day", "village_night"],
        },
        shadow_woods: {
          id: "shadow_woods",
          name: "Bosque Sombrio",
          type: "forest",
          dangerLevel: 3,
          dangerByTime: {
            evening: 2,
            night: 4,
            late_night: 5,
          },
          connectedLocations: ["first_village"],
          npcIds: [],
          eventPoolIds: ["forest_common", "forest_night"],
        },
      },
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

