import type { EnergyState } from "../types";
import { GameRuleError } from "../core/errors";

export function spendStamina(energy: EnergyState, amount: number): EnergyState {
  if (amount < 0) {
    throw new GameRuleError("O custo de stamina nao pode ser negativo.");
  }

  if (energy.stamina < amount) {
    throw new GameRuleError("Stamina insuficiente para essa acao.");
  }

  return {
    ...energy,
    stamina: energy.stamina - amount,
  };
}

export function addFatigue(energy: EnergyState, amount: number): EnergyState {
  return {
    ...energy,
    fatigue: clamp(energy.fatigue + amount, 0, 100),
  };
}

export function sleep(energy: EnergyState, hours: number): EnergyState {
  if (hours <= 0) {
    throw new GameRuleError("O descanso precisa durar pelo menos 1 hora.");
  }

  return {
    ...energy,
    stamina: clamp(energy.stamina + hours * 12, 0, energy.maxStamina),
    fatigue: clamp(energy.fatigue - hours * 10, 0, 100),
    sleepDebt: clamp(energy.sleepDebt - hours, 0, 48),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

