import { enemyDefinitions } from "../../content/enemies/definitions";
import { GameRuleError } from "../core/errors";
import { getEffectiveCombatStats } from "../inventory/inventory";
import { addExperience } from "../progression/experience";
import type { EnemyDefinition, GameState } from "../types";

export type CombatContext = {
  enemies?: EnemyDefinition[];
};

export function startCombat(
  state: GameState,
  enemyId: string,
  context: CombatContext = {},
): GameState {
  if (state.combat) {
    throw new GameRuleError("Ja existe um combate em andamento.");
  }

  const enemy = findEnemy(enemyId, context.enemies);

  return {
    ...state,
    combat: {
      enemyId: enemy.id,
      enemyHp: enemy.maxHp,
      playerDefending: false,
      log: [`${enemy.name} aparece no caminho.`],
    },
  };
}

export function applyPlayerCombatAction(
  state: GameState,
  action: "attack" | "defend" | "flee",
  context: CombatContext = {},
): GameState {
  if (!state.combat) {
    throw new GameRuleError("Nao ha combate em andamento.");
  }

  const enemy = findEnemy(state.combat.enemyId, context.enemies);

  if (action === "flee") {
    return {
      ...state,
      combat: undefined,
      eventLog: [
        {
          id: crypto.randomUUID(),
          createdAtIso: new Date().toISOString(),
          message: `Voce fugiu de ${enemy.name}.`,
        },
        ...state.eventLog,
      ].slice(0, 20),
    };
  }

  if (action === "defend") {
    const enemyDamage = calculateEnemyDamage(enemy, state, true);

    return {
      ...state,
      player: {
        ...state.player,
        hp: Math.max(0, state.player.hp - enemyDamage),
      },
      combat: {
        ...state.combat,
        playerDefending: true,
        log: [
          `Voce assume postura defensiva.`,
          `${enemy.name} ataca e causa ${enemyDamage} de dano reduzido.`,
          ...state.combat.log,
        ].slice(0, 8),
      },
    };
  }

  const playerDamage = calculatePlayerDamage(state, enemy);
  const enemyHp = Math.max(0, state.combat.enemyHp - playerDamage);

  if (enemyHp <= 0) {
    const playerWithRewards = addExperience(
      {
        ...state.player,
        gold: state.player.gold + enemy.goldReward,
      },
      enemy.xpReward,
    );

    return {
      ...state,
      player: playerWithRewards,
      combat: undefined,
      eventLog: [
        {
          id: crypto.randomUUID(),
          createdAtIso: new Date().toISOString(),
          message: `${enemy.name} derrotado. +${enemy.xpReward} XP, +${enemy.goldReward} ouro.`,
        },
        ...state.eventLog,
      ].slice(0, 20),
    };
  }

  const enemyDamage = calculateEnemyDamage(enemy, state, false);

  return {
    ...state,
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - enemyDamage),
    },
    combat: {
      ...state.combat,
      enemyHp,
      playerDefending: false,
      log: [
        `Voce causa ${playerDamage} de dano em ${enemy.name}.`,
        `${enemy.name} contra-ataca e causa ${enemyDamage} de dano.`,
        ...state.combat.log,
      ].slice(0, 8),
    },
  };
}

function calculatePlayerDamage(state: GameState, enemy: EnemyDefinition) {
  const stats = getEffectiveCombatStats(state);

  return Math.max(1, stats.attack + 2 - enemy.defense);
}

function calculateEnemyDamage(
  enemy: EnemyDefinition,
  state: GameState,
  defending: boolean,
) {
  const mitigation = getEffectiveCombatStats(state).defense;
  const rawDamage = Math.max(1, enemy.attack - mitigation);

  return defending ? Math.max(1, Math.floor(rawDamage / 2)) : rawDamage;
}

function findEnemy(enemyId: string, enemies = enemyDefinitions) {
  const enemy = enemies.find((candidate) => candidate.id === enemyId);

  if (!enemy) {
    throw new GameRuleError("Inimigo desconhecido.");
  }

  return enemy;
}
