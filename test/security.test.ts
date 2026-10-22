import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { API_CSP, PAGE_CSP, securityHeaders } from "../shared/security";

describe("security headers", () => {
  it("locks pages to this site and turns off camera, mic, and location", () => {
    const headers = securityHeaders(PAGE_CSP);
    expect(headers["Content-Security-Policy"]).toBe(PAGE_CSP);
    expect(headers["Content-Security-Policy"]).not.toContain("unsafe-inline");
    expect(headers["Content-Security-Policy"]).not.toContain("http://");
    expect(headers["Content-Security-Policy"]).not.toContain("https://");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("microphone=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
    expect(API_CSP).toContain("default-src 'none'");
    expect(API_CSP).toContain("frame-ancestors 'none'");
  });

  it("does not log or store the letter request", () => {
    const source = readFileSync(new URL("../worker/index.ts", import.meta.url), "utf8");
    const logs = source.match(/log\(\{[\s\S]*?\}\)/g) ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const entry of logs) {
      expect(entry).not.toMatch(/prompt|firstName|lastName|email|phone|notes|letterText|body/);
    }
    expect(source).toMatch(/AI_USAGE\.put\(key, String\(/);
    expect(source).toContain("applySecurity");
    expect(source).not.toMatch(/console\.log\((?!JSON\.stringify\(fields\))/);
  });
});