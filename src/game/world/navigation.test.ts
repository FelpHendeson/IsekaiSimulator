import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../core/initial-state";
import {
  canNavigateToLocation,
  getLocationPath,
  getNavigableLocations,
  navigateLocation,
} from "./navigation";

describe("world navigation", () => {
  it("builds a hierarchical path", () => {
    const state = createInitialGameState();
    const path = getLocationPath("first_village", state.world.locations);

    expect(path.map((location) => location.level)).toEqual([
      "planet",
      "continent",
      "country",
      "state",
      "city",
      "locality",
    ]);
  });

  it("lists parent, child and connected locations", () => {
    const state = createInitialGameState();
    const current = state.world.locations.first_village;
    const options = getNavigableLocations(current, state.world.locations);

    expect(options.map((location) => location.id)).toEqual([
      "elaria_city",
      "guild_hall",
      "shadow_woods",
    ]);
  });

  it("allows navigating to connected locations and advances time", () => {
    const state = createInitialGameState();
    const nextState = navigateLocation(state, "guild_hall");

    expect(nextState.currentLocationId).toBe("guild_hall");
    expect(nextState.clock.minute).toBe(50);
  });

  it("blocks disconnected jumps", () => {
    const state = createInitialGameState();

    expect(canNavigateToLocation(state, "elyndor_kingdom")).toBe(false);
  });
});

