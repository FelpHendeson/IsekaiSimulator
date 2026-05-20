import { GameRuleError } from "../core/errors";
import { advanceClock } from "../time/clock";
import type { GameState, LocationDefinition, LocationLevel } from "../types";

export const locationLevelLabels: Record<LocationLevel, string> = {
  planet: "Planeta",
  continent: "Continente",
  country: "Pais",
  state: "Estado",
  city: "Cidade",
  locality: "Localidade",
};

export function navigateLocation(state: GameState, locationId: string): GameState {
  const target = state.world.locations[locationId];

  if (!target) {
    throw new GameRuleError("Local desconhecido.");
  }

  if (!canNavigateToLocation(state, locationId)) {
    throw new GameRuleError("Esse local nao esta conectado ao ponto atual.");
  }

  return {
    ...state,
    currentLocationId: locationId,
    clock: advanceClock(state.clock, getNavigationTimeCost(state.world.locations[state.currentLocationId], target)),
    combat: undefined,
  };
}

export function canNavigateToLocation(state: GameState, locationId: string): boolean {
  const current = state.world.locations[state.currentLocationId];
  const target = state.world.locations[locationId];

  if (!current || !target || current.id === target.id) {
    return false;
  }

  return getNavigableLocations(current, state.world.locations).some(
    (candidate) => candidate.id === locationId,
  );
}

export function getNavigableLocations(
  current: LocationDefinition,
  locations: Record<string, LocationDefinition>,
): LocationDefinition[] {
  const ids = [
    current.parentLocationId,
    ...current.childLocationIds,
    ...current.connectedLocations,
  ].filter(Boolean) as string[];

  return unique(ids)
    .map((id) => locations[id])
    .filter(Boolean);
}

export function getLocationPath(
  locationId: string,
  locations: Record<string, LocationDefinition>,
): LocationDefinition[] {
  const path: LocationDefinition[] = [];
  let current = locations[locationId];

  while (current) {
    path.unshift(current);

    if (!current.parentLocationId) {
      break;
    }

    current = locations[current.parentLocationId];
  }

  return path;
}

function getNavigationTimeCost(
  current: LocationDefinition | undefined,
  target: LocationDefinition,
) {
  if (!current) {
    return 0;
  }

  if (target.parentLocationId === current.id || current.parentLocationId === target.id) {
    return 10;
  }

  if (current.parentLocationId === target.parentLocationId) {
    return target.level === "locality" ? 20 : 30;
  }

  return 45;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

