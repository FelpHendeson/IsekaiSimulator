import { trainingDefinitions } from "../../content/training/definitions";
import { sleep as sleepEnergy } from "../energy/energy";
import { advanceClock } from "../time/clock";
import { claimTraining, startTraining } from "../training/training";
import type { GameAction, GameState, TrainingDefinition } from "../types";

export type GameActionContext = {
  now?: Date;
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

  if (action.type === "START_TRAINING") {
    return startTraining(state, action.trainingId, {
      now,
      definitions,
      createSessionId: context.createSessionId,
      devMode: context.devMode,
    });
  }

  if (action.type === "CLAIM_TRAINING") {
    return claimTraining(state, action.trainingSessionId, {
      now,
      definitions,
      createSessionId: context.createSessionId,
      devMode: context.devMode,
    });
  }

  return {
    ...state,
    clock: advanceClock(state.clock, action.hours * 60),
    player: {
      ...state.player,
      energy: sleepEnergy(state.player.energy, action.hours),
    },
  };
}
