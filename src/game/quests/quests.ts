import { questDefinitions } from "../../content/quests/definitions";
import { GameRuleError } from "../core/errors";
import type { GameState, QuestDefinition, QuestState } from "../types";

export type QuestContext = {
  definitions?: QuestDefinition[];
};

export function getAvailableQuestDefinitions(
  state: GameState,
  definitions = questDefinitions,
): QuestDefinition[] {
  return definitions.filter(
    (quest) =>
      quest.startLocationId === state.currentLocationId &&
      !state.quests.some((questState) => questState.id === quest.id),
  );
}

export function acceptQuest(
  state: GameState,
  questId: string,
  context: QuestContext = {},
): GameState {
  const definitions = context.definitions ?? questDefinitions;
  const quest = definitions.find((candidate) => candidate.id === questId);

  if (!quest) {
    throw new GameRuleError("Missao desconhecida.");
  }

  if (quest.startLocationId !== state.currentLocationId) {
    throw new GameRuleError("Essa missao nao esta disponivel neste local.");
  }

  if (state.quests.some((questState) => questState.id === quest.id)) {
    throw new GameRuleError("Missao ja registrada.");
  }

  return {
    ...state,
    quests: [
      ...state.quests,
      {
        id: quest.id,
        status: "active",
      },
    ],
  };
}

export function getQuestStateLabel(quest: QuestState) {
  const labels: Record<QuestState["status"], string> = {
    available: "Disponivel",
    active: "Ativa",
    completed: "Concluida",
    failed: "Falhou",
  };

  return labels[quest.status];
}

