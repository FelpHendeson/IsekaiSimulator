import { describe, expect, it } from "vitest";
import { applyGameAction } from "../core/apply-action";
import { createInitialGameState } from "../core/initial-state";
import { getAvailableQuestDefinitions } from "./quests";

describe("quests", () => {
  it("lists available quests for current location", () => {
    const state = createInitialGameState();
    const quests = getAvailableQuestDefinitions(state);

    expect(quests.map((quest) => quest.id)).toEqual([
      "awakening_status",
      "shadow_wolf_notice",
      "first_training",
      "night_rumor",
    ]);
  });

  it("accepts an available quest", () => {
    const state = applyGameAction(createInitialGameState(), {
      type: "ACCEPT_QUEST",
      questId: "first_training",
    });

    expect(state.quests).toContainEqual({
      id: "first_training",
      status: "active",
    });
  });
});
