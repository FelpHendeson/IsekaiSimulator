import { itemDefinitions } from "../../content/items/definitions";
import { GameRuleError } from "../core/errors";
import type { GameState, ItemDefinition, PlayerStats } from "../types";

export function useItem(state: GameState, itemId: string): GameState {
  const item = findItem(itemId);

  if (!state.inventory.itemIds.includes(itemId)) {
    throw new GameRuleError("Item nao encontrado no inventario.");
  }

  if (item.type !== "consumable") {
    throw new GameRuleError("Este item nao pode ser usado diretamente.");
  }

  return {
    ...state,
    player: {
      ...state.player,
      hp: Math.min(state.player.maxHp, state.player.hp + (item.effects.heal ?? 0)),
      mana: Math.min(state.player.maxMana, state.player.mana + (item.effects.mana ?? 0)),
    },
    inventory: {
      ...state.inventory,
      itemIds: removeOneItem(state.inventory.itemIds, itemId),
    },
  };
}

export function equipItem(state: GameState, itemId: string): GameState {
  const item = findItem(itemId);

  if (!state.inventory.itemIds.includes(itemId)) {
    throw new GameRuleError("Item nao encontrado no inventario.");
  }

  if (!item.equipSlot) {
    throw new GameRuleError("Este item nao pode ser equipado.");
  }

  return {
    ...state,
    inventory: {
      ...state.inventory,
      equipped: {
        ...state.inventory.equipped,
        [item.equipSlot]: item.id,
      },
    },
  };
}

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return itemDefinitions.find((item) => item.id === itemId);
}

export function getInventoryItems(itemIds: string[]): ItemDefinition[] {
  return itemIds
    .map((itemId) => getItemDefinition(itemId))
    .filter((item): item is ItemDefinition => Boolean(item));
}

export function getEquipmentBonuses(state: GameState) {
  const equippedItems = Object.values(state.inventory.equipped)
    .map((itemId) => (itemId ? getItemDefinition(itemId) : undefined))
    .filter((item): item is ItemDefinition => Boolean(item));

  return equippedItems.reduce(
    (bonuses, item) => ({
      attack: bonuses.attack + (item.effects.attack ?? 0),
      defense: bonuses.defense + (item.effects.defense ?? 0),
      speed: bonuses.speed + (item.effects.speed ?? 0),
    }),
    { attack: 0, defense: 0, speed: 0 },
  );
}

export function getEffectiveCombatStats(state: GameState) {
  const bonuses = getEquipmentBonuses(state);

  return {
    attack: state.player.stats.strength + bonuses.attack,
    defense: Math.floor(state.player.stats.vitality / 2) + bonuses.defense,
    speed: state.player.stats.agility + bonuses.speed,
  };
}

export function getStatPreview(stats: PlayerStats) {
  return {
    attack: stats.strength,
    defense: Math.floor(stats.vitality / 2),
    speed: stats.agility,
  };
}

function findItem(itemId: string): ItemDefinition {
  const item = getItemDefinition(itemId);

  if (!item) {
    throw new GameRuleError("Item desconhecido.");
  }

  return item;
}

function removeOneItem(itemIds: string[], itemId: string) {
  const index = itemIds.indexOf(itemId);

  if (index === -1) {
    return itemIds;
  }

  return [...itemIds.slice(0, index), ...itemIds.slice(index + 1)];
}

