import { describe, expect, it } from "vitest";
import { sceneDefinitions } from "../../content/scenes/definitions";
import { applyGameAction } from "../core/apply-action";
import { createInitialGameState } from "../core/initial-state";

describe("scene choices", () => {
  it("moves to the next scene and advances time", () => {
    const state = {
      ...createInitialGameState(),
      currentSceneId: "reincarnation_intro",
    };
    const nextState = applyGameAction(
      state,
      { type: "CHOOSE_SCENE_OPTION", optionId: "inspect_status" },
      {
        now: new Date("2026-05-20T12:00:00.000Z"),
        sceneDefinitions,
      },
    );

    expect(nextState.currentSceneId).toBe("status_awakened");
    expect(nextState.clock.minute).toBe(35);
    expect(nextState.flags.saw_status_screen).toBe(true);
  });

  it("can start a quest and add gold through effects", () => {
    const state = {
      ...createInitialGameState(),
      currentSceneId: "old_man_intro",
      player: {
        ...createInitialGameState().player,
        gold: 35,
      },
    };

    const nextState = applyGameAction(
      state,
      { type: "CHOOSE_SCENE_OPTION", optionId: "accept_old_man_help" },
      {
        now: new Date("2026-05-20T12:00:00.000Z"),
        sceneDefinitions,
      },
    );

    expect(nextState.player.gold).toBe(45);
    expect(nextState.quests).toContainEqual({
      id: "guild_registration",
      status: "active",
    });
  });
});
