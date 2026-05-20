import { describe, expect, it } from "vitest";
import { applyGameAction } from "../core/apply-action";
import { createInitialGameState } from "../core/initial-state";

describe("dangerous area encounters", () => {
  it("starts combat when navigating into a dangerous area", () => {
    const state = applyGameAction(createInitialGameState(), {
      type: "NAVIGATE_LOCATION",
      locationId: "shadow_woods",
    });

    expect(state.currentLocationId).toBe("shadow_woods");
    expect(state.combat?.enemyId).toBe("shadow_wolf");
  });

  it("does not start combat when navigating to a safe location", () => {
    const state = applyGameAction(createInitialGameState(), {
      type: "NAVIGATE_LOCATION",
      locationId: "guild_hall",
    });

    expect(state.currentLocationId).toBe("guild_hall");
    expect(state.combat).toBeUndefined();
  });
});

