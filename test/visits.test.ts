import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { onRequest } from "../functions/api/visits";
import {
  SESSION_FLAG,
  TOTAL_KEY,
  addVisit,
  claimSessionVisit,
  formatVisits,
  parseTotal,
  readTotal,
  type CounterStore,
} from "../shared/visits";

class MemoryKv implements CounterStore {
  data = new Map<string, string>();
  puts: { key: string; value: string }[] = [];
  async get(key: string) {
    return this.data.get(key) ?? null;
  }
  async put(key: string, value: string) {
    this.puts.push({ key, value });
    this.data.set(key, value);
  }
}

class MemorySession {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

// Minimal Pages context for the handler.
function call(method: string, kv: MemoryKv | undefined, headers: Record<string, string> = {}) {
  const request = new Request("https://test-whats-new.shieldme.pages.dev/api/visits", { method, headers });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return onRequest({ request, env: { VISITS: kv } } as any) as Promise<Response>;
}

describe("visit counter", () => {
  it("adds one per call and reads the total", async () => {
    const kv = new MemoryKv();
    expect(await readTotal(kv)).toBe(0);
    expect(await addVisit(kv)).toBe(1);
    expect(await addVisit(kv)).toBe(2);
    expect(await readTotal(kv)).toBe(2);
    expect(parseTotal("abc")).toBe(0);
    expect(parseTotal("-4")).toBe(0);
  });

  it("only ever stores one number under one key", async () => {
    const kv = new MemoryKv();
    await addVisit(kv);
    await addVisit(kv);
    expect([...kv.data.keys()]).toEqual([TOTAL_KEY]);
    for (const put of kv.puts) {
      expect(put.key).toBe(TOTAL_KEY);
      expect(put.value).toMatch(/^\d+$/);
    }
  });

  it("counts a browser session once", () => {
    const session = new MemorySession();
    expect(claimSessionVisit(session)).toBe(true);
    expect(claimSessionVisit(session)).toBe(false);
    expect(claimSessionVisit(session)).toBe(false);
    expect([...session.data.entries()]).toEqual([[SESSION_FLAG, "1"]]);
    expect(claimSessionVisit(null)).toBe(false);
  });

  it("GET reads, POST adds, and nothing sets a cookie", async () => {
    const kv = new MemoryKv();
    let res = await call("POST", kv, { Origin: "https://test-whats-new.shieldme.pages.dev" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ total: 1 });
    expect(res.headers.get("Set-Cookie")).toBeNull();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    res = await call("GET", kv);
    expect(await res.json()).toEqual({ total: 1 });
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  it("refuses other sites, other methods, and works without the binding", async () => {
    const kv = new MemoryKv();
    expect((await call("POST", kv, { Origin: "https://evil.example" })).status).toBe(403);
    expect(await readTotal(kv)).toBe(0);
    expect((await call("DELETE", kv)).status).toBe(405);
    const missing = await call("GET", undefined);
    expect(missing.status).toBe(503);
    expect(await missing.json()).toEqual({ total: null });
  });

  it("never reads visitor details in the function", () => {
    const source = readFileSync(new URL("../functions/api/visits.ts", import.meta.url), "utf8");
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/CF-Connecting-IP|User-Agent|Cookie|request\.cf|console\./i);
  });

  it("formats the total", () => {
    expect(formatVisits(1)).toBe("1 visit");
    expect(formatVisits(1234)).toBe("1,234 visits");
  });

  it("is the only new Function route besides the letter", () => {
    const routes = JSON.parse(readFileSync(new URL("../public/_routes.json", import.meta.url), "utf8"));
    expect(routes.include).toEqual(["/api/letter", "/api/visits"]);
  });
});
