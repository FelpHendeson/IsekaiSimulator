import { describe, expect, it } from "vitest";
import { applyGameAction } from "../core/apply-action";
import { createInitialGameState } from "../core/initial-state";
import { getEffectiveCombatStats } from "./inventory";

describe("inventory", () => {
  it("uses a healing potion", () => {
    const initialState = createInitialGameState();
    const state = {
      ...initialState,
      player: {
        ...initialState.player,
        hp: 10,
      },
    };

    const nextState = applyGameAction(state, {
      type: "USE_ITEM",
      itemId: "small_potion",
    });

    expect(nextState.player.hp).toBe(30);
    expect(nextState.inventory.itemIds).not.toContain("small_potion");
  });

  it("equips a weapon and applies combat bonuses", () => {
    const state = applyGameAction(createInitialGameState(), {
      type: "EQUIP_ITEM",
      itemId: "iron_sword",
    });

    expect(state.inventory.equipped.weapon).toBe("iron_sword");
    expect(getEffectiveCombatStats(state).attack).toBe(9);
  });
});

