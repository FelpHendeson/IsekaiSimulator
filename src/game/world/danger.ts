import type { GameClockState, LocationDefinition } from "../types";

export function getEffectiveDanger(
  location: LocationDefinition,
  clock: GameClockState,
): number {
  const modifier = location.dangerByTime?.[clock.period] ?? 0;

  return Math.max(0, location.dangerLevel + modifier);
}

