/**
 * Anonymous visit counter.
 *
 * The server keeps one number in Workers KV under TOTAL_KEY. Nothing about the
 * visitor is stored: no cookie, no IP address, no user agent, no id. The browser
 * keeps a plain "1" in sessionStorage so the same tab session is counted once.
 */
export const TOTAL_KEY = "visits:total";
export const SESSION_FLAG = "pd_visit_counted";
export const VISITS_PATH = "/api/visits";

/** Minimal KV surface, so tests can pass a plain Map-backed fake. */
export type CounterStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

export function parseTotal(value: string | null): number {
  const n = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function readTotal(store: CounterStore): Promise<number> {
  return parseTotal(await store.get(TOTAL_KEY));
}

/**
 * Add one and return the new total. KV is not a lock: two visits in the same
 * second can count as one. That makes the number a slight undercount, never an
 * overcount.
 */
export async function addVisit(store: CounterStore): Promise<number> {
  const next = (await readTotal(store)) + 1;
  await store.put(TOTAL_KEY, String(next));
  return next;
}

/** Minimal Storage surface (window.sessionStorage in the browser). */
export type SessionFlagStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/** True the first time in a browser session. Marks the session so later page views are not counted. */
export function claimSessionVisit(storage: SessionFlagStore | null): boolean {
  if (!storage) return false;
  try {
    if (storage.getItem(SESSION_FLAG) === "1") return false;
    storage.setItem(SESSION_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}

export function formatVisits(total: number): string {
  return `${total.toLocaleString("en-US")} ${total === 1 ? "visit" : "visits"}`;
}
