import { describe, expect, it } from "vitest";
import { applyGameAction } from "../core/apply-action";
import { createInitialGameState } from "../core/initial-state";

describe("combat", () => {
  it("starts combat against an enemy", () => {
    const state = applyGameAction(createInitialGameState(), {
      type: "START_COMBAT",
      enemyId: "shadow_wolf",
    });

    expect(state.combat).toMatchObject({
      enemyId: "shadow_wolf",
      enemyHp: 18,
    });
  });

  it("attacks and receives counter damage", () => {
    const started = applyGameAction(createInitialGameState(), {
      type: "START_COMBAT",
      enemyId: "shadow_wolf",
    });
    const nextState = applyGameAction(started, {
      type: "PLAYER_COMBAT_ACTION",
      action: "attack",
    });

    expect(nextState.combat?.enemyHp).toBe(14);
    expect(nextState.player.hp).toBe(25);
  });

  it("grants rewards when enemy is defeated", () => {
    const started = {
      ...applyGameAction(createInitialGameState(), {
        type: "START_COMBAT",
        enemyId: "training_dummy",
      }),
      combat: {
        enemyId: "training_dummy",
        enemyHp: 4,
        playerDefending: false,
        log: [],
      },
    };

    const nextState = applyGameAction(started, {
      type: "PLAYER_COMBAT_ACTION",
      action: "attack",
    });

    expect(nextState.combat).toBeUndefined();
    expect(nextState.player.xp).toBe(5);
  });
});

