import { addFatigue, spendStamina } from "../energy/energy";
import { GameRuleError } from "../core/errors";
import { advanceClock } from "../time/clock";
import type {
  GameState,
  PlayerState,
  TrainingDefinition,
  TrainingReward,
  TrainingSession,
} from "../types";

export type TrainingContext = {
  now: Date;
  definitions: TrainingDefinition[];
  createSessionId?: () => string;
  devMode?: boolean;
};

export function startTraining(
  state: GameState,
  trainingId: string,
  context: TrainingContext,
): GameState {
  if (state.activeTrainingSessions.length > 0) {
    throw new GameRuleError("Ja existe um treino em andamento.");
  }

  const training = findTraining(context.definitions, trainingId);
  const playerAfterCost = chargeTrainingCost(state.player, training);
  const session = createTrainingSession(training, context);

  return {
    ...state,
    player: playerAfterCost,
    activeTrainingSessions: [...state.activeTrainingSessions, session],
  };
}

export function claimTraining(
  state: GameState,
  trainingSessionId: string,
  context: TrainingContext,
): GameState {
  const session = state.activeTrainingSessions.find(
    (candidate) => candidate.id === trainingSessionId,
  );

  if (!session) {
    throw new GameRuleError("Treino nao encontrado.");
  }

  if (!context.devMode && context.now.getTime() < new Date(session.finishesAtIso).getTime()) {
    throw new GameRuleError("Treino ainda nao terminou.");
  }

  const training = findTraining(context.definitions, session.trainingId);
  const playerWithRewards = applyTrainingRewards(state.player, training.rewards);
  const playerAfterFatigue = {
    ...playerWithRewards,
    energy: addFatigue(playerWithRewards.energy, training.fatigueGain),
  };

  return {
    ...state,
    clock: advanceClock(state.clock, session.worldTimeAdvanceMinutes),
    player: playerAfterFatigue,
    activeTrainingSessions: state.activeTrainingSessions.filter(
      (candidate) => candidate.id !== trainingSessionId,
    ),
  };
}

function chargeTrainingCost(player: PlayerState, training: TrainingDefinition): PlayerState {
  if (training.goldCost && player.gold < training.goldCost) {
    throw new GameRuleError("Ouro insuficiente para iniciar esse treino.");
  }

  return {
    ...player,
    gold: player.gold - (training.goldCost ?? 0),
    energy: spendStamina(player.energy, training.staminaCost),
  };
}

function createTrainingSession(
  training: TrainingDefinition,
  context: TrainingContext,
): TrainingSession {
  const startedAtMs = context.now.getTime();
  const finishesAtMs = startedAtMs + training.realDurationMinutes * 60 * 1000;

  return {
    id: context.createSessionId?.() ?? crypto.randomUUID(),
    trainingId: training.id,
    startedAtIso: new Date(startedAtMs).toISOString(),
    finishesAtIso: new Date(finishesAtMs).toISOString(),
    worldTimeAdvanceMinutes: training.worldTimeAdvanceMinutes,
    staminaCost: training.staminaCost,
  };
}

function applyTrainingRewards(player: PlayerState, rewards: TrainingReward[]): PlayerState {
  return rewards.reduce((currentPlayer, reward) => {
    if (reward.type === "stat") {
      return {
        ...currentPlayer,
        stats: {
          ...currentPlayer.stats,
          [reward.stat]: currentPlayer.stats[reward.stat] + reward.amount,
        },
      };
    }

    if (reward.type === "maxStamina") {
      return {
        ...currentPlayer,
        energy: {
          ...currentPlayer.energy,
          maxStamina: currentPlayer.energy.maxStamina + reward.amount,
        },
      };
    }

    return {
      ...currentPlayer,
      maxHp: currentPlayer.maxHp + reward.amount,
      hp: currentPlayer.hp + reward.amount,
    };
  }, player);
}

function findTraining(
  definitions: TrainingDefinition[],
  trainingId: string,
): TrainingDefinition {
  const training = definitions.find((candidate) => candidate.id === trainingId);

  if (!training) {
    throw new GameRuleError("Treino desconhecido.");
  }

  return training;
}
