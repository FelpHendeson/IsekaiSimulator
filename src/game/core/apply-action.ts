import { sceneDefinitions } from "../../content/scenes/definitions";
import { trainingDefinitions } from "../../content/training/definitions";
import { applyPlayerCombatAction, startCombat } from "../combat/combat";
import { sleep as sleepEnergy } from "../energy/energy";
import { chooseSceneOption } from "../narrative/scenes";
import { acceptQuest } from "../quests/quests";
import { advanceClock } from "../time/clock";
import { claimTraining, startTraining } from "../training/training";
import { resolveDangerousAreaEncounter } from "../world/encounters";
import { navigateLocation } from "../world/navigation";
import type { GameAction, GameState, SceneDefinition, TrainingDefinition } from "../types";

export type GameActionContext = {
  now?: Date;
  sceneDefinitions?: SceneDefinition[];
  trainingDefinitions?: TrainingDefinition[];
  createSessionId?: () => string;
  devMode?: boolean;
};

export function applyGameAction(
  state: GameState,
  action: GameAction,
  context: GameActionContext = {},
): GameState {
  const now = context.now ?? new Date();
  const definitions = context.trainingDefinitions ?? trainingDefinitions;
  const scenes = context.sceneDefinitions ?? sceneDefinitions;

  if (action.type === "CHOOSE_SCENE_OPTION") {
    const nextState = chooseSceneOption(state, action.optionId, {
      now,
      definitions: scenes,
    });

    return resolveDangerousAreaEncounter(nextState);
  }

  if (action.type === "NAVIGATE_LOCATION") {
    return navigateLocation(state, action.locationId);
  }

  if (action.type === "ACCEPT_QUEST") {
    return acceptQuest(state, action.questId);
  }

  if (action.type === "START_COMBAT") {
    return startCombat(state, action.enemyId);
  }

  if (action.type === "PLAYER_COMBAT_ACTION") {
    return applyPlayerCombatAction(state, action.action);
  }

  if (action.type === "START_TRAINING") {
    return startTraining(state, action.trainingId, {
      now,
      definitions,
      createSessionId: context.createSessionId,
      devMode: context.devMode,
    });
  }

  if (action.type === "CLAIM_TRAINING") {
    const nextState = claimTraining(state, action.trainingSessionId, {
      now,
      definitions,
      createSessionId: context.createSessionId,
      devMode: context.devMode,
    });

    return resolveDangerousAreaEncounter(nextState);
  }

  const nextState = {
    ...state,
    clock: advanceClock(state.clock, action.hours * 60),
    player: {
      ...state.player,
      energy: sleepEnergy(state.player.energy, action.hours),
    },
  };

  return resolveDangerousAreaEncounter(nextState);
}
