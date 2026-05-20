import type { PlayerState } from "../types";

export function addExperience(player: PlayerState, amount: number): PlayerState {
  let nextPlayer = {
    ...player,
    xp: player.xp + amount,
  };

  while (nextPlayer.xp >= getRequiredXp(nextPlayer.level)) {
    nextPlayer = levelUp(nextPlayer);
  }

  return nextPlayer;
}

export function getRequiredXp(level: number) {
  return level * 100;
}

function levelUp(player: PlayerState): PlayerState {
  const requiredXp = getRequiredXp(player.level);

  return {
    ...player,
    level: player.level + 1,
    xp: player.xp - requiredXp,
    maxHp: player.maxHp + 5,
    hp: player.maxHp + 5,
    maxMana: player.maxMana + 2,
    mana: player.maxMana + 2,
    stats: {
      ...player.stats,
      vitality: player.stats.vitality + 1,
    },
  };
}

