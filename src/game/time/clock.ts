import type { GameClockState, TimePeriod } from "../types";

const MINUTES_PER_DAY = 24 * 60;

export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  if (hour >= 21 && hour < 24) return "night";
  return "late_night";
}

export function createClock(day: number, hour: number, minute: number): GameClockState {
  return normalizeClock({ day, hour, minute, period: getTimePeriod(hour) });
}

export function advanceClock(clock: GameClockState, minutes: number): GameClockState {
  return normalizeClock({
    ...clock,
    minute: clock.minute + minutes,
  });
}

export function normalizeClock(clock: GameClockState): GameClockState {
  const currentTotal =
    Math.max(0, clock.day - 1) * MINUTES_PER_DAY + clock.hour * 60 + clock.minute;
  const safeTotal = Math.max(0, currentTotal);
  const day = Math.floor(safeTotal / MINUTES_PER_DAY) + 1;
  const minuteOfDay = safeTotal % MINUTES_PER_DAY;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;

  return {
    day,
    hour,
    minute,
    period: getTimePeriod(hour),
  };
}

export function formatClock(clock: GameClockState): string {
  const hour = String(clock.hour).padStart(2, "0");
  const minute = String(clock.minute).padStart(2, "0");

  return `Dia ${clock.day}, ${hour}:${minute}`;
}

