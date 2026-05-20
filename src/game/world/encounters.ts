import { startCombat } from "../combat/combat";
import { getEffectiveDanger } from "./danger";
import type { GameState } from "../types";

const DANGEROUS_ENCOUNTER_THRESHOLD = 3;

export function resolveDangerousAreaEncounter(state: GameState): GameState {
  if (state.combat) {
    return state;
  }

  const location = state.world.locations[state.currentLocationId];

  if (!location) {
    return state;
  }

  const danger = getEffectiveDanger(location, state.clock);

  if (danger < DANGEROUS_ENCOUNTER_THRESHOLD) {
    return state;
  }

  return startCombat(state, "shadow_wolf");
}

