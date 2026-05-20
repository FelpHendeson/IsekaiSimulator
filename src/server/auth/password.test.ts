import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a valid password", () => {
    const stored = hashPassword("secret123");

    expect(verifyPassword("secret123", stored)).toBe(true);
  });

  it("rejects an invalid password", () => {
    const stored = hashPassword("secret123");

    expect(verifyPassword("wrong-password", stored)).toBe(false);
  });
});

