import { GameRuleError } from "../core/errors";
import { advanceClock } from "../time/clock";
import type {
  GameLogEntry,
  GameState,
  QuestState,
  SceneChoice,
  SceneDefinition,
  SceneEffect,
  SceneRequirement,
} from "../types";

export type SceneContext = {
  now: Date;
  definitions: SceneDefinition[];
};

export function getCurrentScene(
  state: GameState,
  definitions: SceneDefinition[],
): SceneDefinition | undefined {
  return definitions.find((scene) => scene.id === state.currentSceneId);
}

export function chooseSceneOption(
  state: GameState,
  optionId: string,
  context: SceneContext,
): GameState {
  const scene = getCurrentScene(state, context.definitions);

  if (!scene) {
    throw new GameRuleError("Cena atual nao encontrada.");
  }

  const choice = scene.choices.find((candidate) => candidate.id === optionId);

  if (!choice) {
    throw new GameRuleError("Escolha nao encontrada nesta cena.");
  }

  if (!isChoiceAvailable(state, choice)) {
    throw new GameRuleError("Requisitos da escolha nao foram cumpridos.");
  }

  const stateAfterEffects = applySceneEffects(state, choice.effects ?? [], context.now);

  return {
    ...stateAfterEffects,
    currentSceneId: choice.nextSceneId ?? stateAfterEffects.currentSceneId,
    clock: advanceClock(stateAfterEffects.clock, choice.timeCostMinutes ?? 0),
  };
}

export function isChoiceAvailable(state: GameState, choice: SceneChoice): boolean {
  return (choice.requirements ?? []).every((requirement) =>
    isRequirementMet(state, requirement),
  );
}

function isRequirementMet(state: GameState, requirement: SceneRequirement): boolean {
  if (requirement.type === "flagEquals") {
    return state.flags[requirement.key] === requirement.value;
  }

  return state.inventory.itemIds.includes(requirement.itemId);
}

function applySceneEffects(
  state: GameState,
  effects: SceneEffect[],
  now: Date,
): GameState {
  return effects.reduce((currentState, effect) => applySceneEffect(currentState, effect, now), state);
}

function applySceneEffect(state: GameState, effect: SceneEffect, now: Date): GameState {
  if (effect.type === "setFlag") {
    return {
      ...state,
      flags: {
        ...state.flags,
        [effect.key]: effect.value,
      },
    };
  }

  if (effect.type === "addGold") {
    return {
      ...state,
      player: {
        ...state.player,
        gold: Math.max(0, state.player.gold + effect.amount),
      },
    };
  }

  if (effect.type === "addItem") {
    return {
      ...state,
      inventory: {
        ...state.inventory,
        itemIds: [...state.inventory.itemIds, effect.itemId],
      },
    };
  }

  if (effect.type === "startQuest") {
    return {
      ...state,
      quests: upsertQuest(state.quests, {
        id: effect.questId,
        status: "active",
      }),
    };
  }

  if (effect.type === "setLocation") {
    return {
      ...state,
      currentLocationId: effect.locationId,
    };
  }

  return {
    ...state,
    eventLog: [
      createLogEntry(effect.message, now),
      ...state.eventLog,
    ].slice(0, 20),
  };
}

function upsertQuest(quests: QuestState[], nextQuest: QuestState): QuestState[] {
  const existing = quests.find((quest) => quest.id === nextQuest.id);

  if (existing) {
    return quests.map((quest) => (quest.id === nextQuest.id ? nextQuest : quest));
  }

  return [...quests, nextQuest];
}

function createLogEntry(message: string, now: Date): GameLogEntry {
  return {
    id: crypto.randomUUID(),
    createdAtIso: now.toISOString(),
    message,
  };
}

