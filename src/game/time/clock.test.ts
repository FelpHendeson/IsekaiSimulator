import { describe, expect, it } from "vitest";
import { advanceClock, createClock, formatClock, getTimePeriod } from "./clock";

describe("game clock", () => {
  it("maps hours to periods", () => {
    expect(getTimePeriod(6)).toBe("dawn");
    expect(getTimePeriod(9)).toBe("morning");
    expect(getTimePeriod(15)).toBe("afternoon");
    expect(getTimePeriod(19)).toBe("evening");
    expect(getTimePeriod(22)).toBe("night");
    expect(getTimePeriod(2)).toBe("late_night");
  });

  it("advances time across periods", () => {
    const clock = createClock(1, 7, 30);
    const advanced = advanceClock(clock, 12 * 60);

    expect(formatClock(advanced)).toBe("Dia 1, 19:30");
    expect(advanced.period).toBe("evening");
  });

  it("wraps into the next day", () => {
    const clock = createClock(1, 23, 45);
    const advanced = advanceClock(clock, 45);

    expect(formatClock(advanced)).toBe("Dia 2, 00:30");
    expect(advanced.period).toBe("late_night");
  });
});

