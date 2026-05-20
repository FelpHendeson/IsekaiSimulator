import type { GameClockState, NpcDefinition } from "../types";

export function getAvailableNpcs(
  npcs: NpcDefinition[],
  locationId: string,
  clock: GameClockState,
): NpcDefinition[] {
  return npcs.filter((npc) =>
    npc.schedule.some(
      (rule) => rule.locationId === locationId && rule.period === clock.period,
    ),
  );
}

export function getNpcInteractions(
  npc: NpcDefinition,
  locationId: string,
  clock: GameClockState,
): string[] {
  return npc.schedule
    .filter((rule) => rule.locationId === locationId && rule.period === clock.period)
    .flatMap((rule) => rule.availableInteractions);
}

