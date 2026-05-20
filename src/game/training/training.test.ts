import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../core/initial-state";
import { applyGameAction } from "../core/apply-action";
import { GameRuleError } from "../core/errors";
import { trainingDefinitions } from "../../content/training/definitions";

describe("training", () => {
  it("starts a real-time training session and charges costs", () => {
    const state = createInitialGameState();
    const now = new Date("2026-05-20T12:00:00.000Z");

    const nextState = applyGameAction(
      state,
      { type: "START_TRAINING", trainingId: "strength_basics" },
      {
        now,
        createSessionId: () => "training-1",
      },
    );

    expect(nextState.player.energy.stamina).toBe(20);
    expect(nextState.player.gold).toBe(15);
    expect(nextState.player.stats.strength).toBe(4);
    expect(nextState.activeTrainingSessions).toEqual([
      {
        id: "training-1",
        trainingId: "strength_basics",
        startedAtIso: "2026-05-20T12:00:00.000Z",
        finishesAtIso: "2026-05-20T12:30:00.000Z",
        worldTimeAdvanceMinutes: 720,
        staminaCost: 60,
      },
    ]);
  });

  it("does not claim training before the real timer finishes", () => {
    const state = createInitialGameState();
    const started = applyGameAction(
      state,
      { type: "START_TRAINING", trainingId: "strength_basics" },
      {
        now: new Date("2026-05-20T12:00:00.000Z"),
        createSessionId: () => "training-1",
      },
    );

    expect(() =>
      applyGameAction(
        started,
        { type: "CLAIM_TRAINING", trainingSessionId: "training-1" },
        {
          now: new Date("2026-05-20T12:29:59.000Z"),
          trainingDefinitions,
        },
      ),
    ).toThrow(GameRuleError);
  });

  it("claims training rewards and advances world time", () => {
    const state = createInitialGameState();
    const started = applyGameAction(
      state,
      { type: "START_TRAINING", trainingId: "strength_basics" },
      {
        now: new Date("2026-05-20T12:00:00.000Z"),
        createSessionId: () => "training-1",
      },
    );

    const claimed = applyGameAction(
      started,
      { type: "CLAIM_TRAINING", trainingSessionId: "training-1" },
      {
        now: new Date("2026-05-20T12:30:00.000Z"),
      },
    );

    expect(claimed.clock).toMatchObject({
      day: 1,
      hour: 19,
      minute: 30,
      period: "evening",
    });
    expect(claimed.player.stats.strength).toBe(5);
    expect(claimed.player.stats.vitality).toBe(5);
    expect(claimed.player.maxHp).toBe(32);
    expect(claimed.player.energy.fatigue).toBe(18);
    expect(claimed.activeTrainingSessions).toEqual([]);
  });
});

