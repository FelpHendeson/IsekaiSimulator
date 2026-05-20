import { describe, expect, it } from "vitest";
import { npcDefinitions } from "../../content/npcs/definitions";
import { createClock } from "../time/clock";
import { getAvailableNpcs, getNpcInteractions } from "./schedule";

describe("npc schedule", () => {
  it("returns daytime NPCs in the village", () => {
    const npcs = getAvailableNpcs(npcDefinitions, "first_village", createClock(1, 9, 0));

    expect(npcs.map((npc) => npc.id)).toEqual([
      "hooded_mentor",
      "village_blacksmith",
      "guild_clerk",
    ]);
  });

  it("returns night-only NPCs at night", () => {
    const npcs = getAvailableNpcs(npcDefinitions, "first_village", createClock(1, 22, 0));

    expect(npcs.map((npc) => npc.id)).toContain("night_informant");
    expect(npcs.map((npc) => npc.id)).not.toContain("guild_clerk");
  });

  it("returns interactions for the current schedule slot", () => {
    const informant = npcDefinitions.find((npc) => npc.id === "night_informant");

    expect(informant).toBeDefined();
    expect(getNpcInteractions(informant!, "first_village", createClock(1, 1, 0))).toContain(
      "forbidden_info",
    );
  });
});

