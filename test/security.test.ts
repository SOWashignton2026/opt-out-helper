import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { API_CSP, PAGE_CSP, securityHeaders } from "../shared/security";

function filesUnder(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...filesUnder(path));
    else found.push(path);
  }
  return found;
}

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
    const source = readFileSync(new URL("../functions/api/letter.ts", import.meta.url), "utf8");
    const logs = source.match(/log\(\{[\s\S]*?\}\)/g) ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const entry of logs) {
      expect(entry).not.toMatch(/prompt|firstName|lastName|email|phone|notes|letterText|body/);
    }
    expect(source).toMatch(/AI_USAGE\.put\(key, String\(/);
    expect(source).toContain("applySecurity");
    expect(source).toContain("export const onRequest");
    expect(source).not.toContain("ASSETS");
    expect(source).not.toMatch(/console\.log\((?!JSON\.stringify\(fields\))/);
  });

  it("sends the page policy on static files and only runs a Function for the API", () => {
    const headersFile = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
    expect(headersFile.trimStart().startsWith("/*")).toBe(true);
    for (const [name, value] of Object.entries(securityHeaders(PAGE_CSP))) {
      expect(headersFile).toContain(`${name}: ${value}`);
    }
    const routes = JSON.parse(readFileSync(new URL("../public/_routes.json", import.meta.url), "utf8")) as {
      version: number;
      include: string[];
      exclude: string[];
    };
    expect(routes).toEqual({ version: 1, include: ["/api/letter"], exclude: [] });
  });

  it("keeps the account subdomain out of public copy", () => {
    const root = new URL("..", import.meta.url);
    const paths = ["index.html", "README.md", ...filesUnder(new URL("src", root).pathname), ...filesUnder(new URL("public", root).pathname)];
    for (const path of paths) {
      const text = readFileSync(path.startsWith("/") ? path : new URL(path, root), "utf8").toLowerCase();
      expect(text).not.toContain("washington2026");
      expect(text).not.toContain("sowashington2026");
    }
  });
});