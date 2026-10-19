import { describe, expect, it } from "vitest";
import {
  AI_DAILY_LIMIT_PER_VISITOR,
  decideCap,
  hashVisitorId,
  isVisitorCookie,
  parseDailyLimit,
  readCookie,
  selectVisitorMaterial,
  usageKey,
  utcDateKey,
  visitorCookie,
} from "../shared/cap";

describe("daily cap", () => {
  it("allows 10 letters and blocks the next one", () => {
    expect(AI_DAILY_LIMIT_PER_VISITOR).toBe(10);
    const ninth = decideCap(9);
    expect(ninth).toEqual({ action: "allow", storedCount: 10, remaining: 0 });
    const tenth = decideCap(10);
    expect(tenth).toEqual({ action: "block", storedCount: 10, remaining: 0 });
    expect(decideCap(0).remaining).toBe(9);
  });

  it("treats junk counts as zero and ignores a bad limit setting", () => {
    expect(decideCap(Number.NaN).action).toBe("allow");
    expect(parseDailyLimit(undefined)).toBe(10);
    expect(parseDailyLimit("nope")).toBe(10);
    expect(parseDailyLimit("4")).toBe(4);
  });

  it("keys a real cookie and falls back to IP", () => {
    const id = "11111111-2222-4333-8444-555555555555";
    expect(isVisitorCookie(id)).toBe(true);
    expect(selectVisitorMaterial(id, "203.0.113.8")).toEqual({
      material: `cookie:${id}`,
      source: "cookie",
    });
    expect(selectVisitorMaterial(null, "203.0.113.8")).toEqual({
      material: "ip:203.0.113.8",
      source: "ip",
    });
    expect(selectVisitorMaterial("not-a-cookie", "203.0.113.8").source).toBe("ip");
  });

  it("hashes the visitor material and keeps the raw id out of the storage key", async () => {
    const material = "cookie:11111111-2222-4333-8444-555555555555";
    const hash = await hashVisitorId(material);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("11111111");
    const again = await hashVisitorId(material);
    expect(again).toBe(hash);
    const key = usageKey(hash, utcDateKey(new Date("2026-10-19T23:30:00Z")));
    expect(key).toBe(`ai:2026-10-19:${hash}`);
  });

  it("reads the visitor cookie and marks it HttpOnly", () => {
    expect(readCookie("a=1; ooh_vid=abc%2Ddef; b=2", "ooh_vid")).toBe("abc-def");
    expect(readCookie("ooh_vid=%", "ooh_vid")).toBeNull();
    expect(readCookie(null, "ooh_vid")).toBeNull();
    const header = visitorCookie("11111111-2222-4333-8444-555555555555", true);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");
    expect(visitorCookie("11111111-2222-4333-8444-555555555555", false)).not.toContain("Secure");
  });
});
