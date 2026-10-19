/** Successful AI letters allowed for one visitor during one UTC day. */
export const AI_DAILY_LIMIT_PER_VISITOR = 10;

export const VISITOR_COOKIE = "ooh_vid";

const COOKIE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function parseDailyLimit(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return AI_DAILY_LIMIT_PER_VISITOR;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    return AI_DAILY_LIMIT_PER_VISITOR;
  }
  return value;
}

export function isVisitorCookie(value: string | null): boolean {
  return Boolean(value && COOKIE_ID.test(value));
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const value = part.slice(separator + 1).trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Prefer the random cookie. If the browser did not send one, fall back to IP
 * so someone who blocks cookies still shares one daily counter.
 */
export function selectVisitorMaterial(
  cookieValue: string | null,
  ip: string | null,
): { material: string; source: "cookie" | "ip" } {
  if (cookieValue && COOKIE_ID.test(cookieValue)) {
    return { material: `cookie:${cookieValue}`, source: "cookie" };
  }
  const cleanIp = (ip ?? "").trim();
  return { material: `ip:${cleanIp || "unknown"}`, source: "ip" };
}

export async function hashVisitorId(material: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function usageKey(hashedId: string, date: string): string {
  return `ai:${date}:${hashedId}`;
}

export type CapDecision =
  | { action: "allow"; storedCount: number; remaining: number }
  | { action: "block"; storedCount: number; remaining: 0 };

/** Decide whether this letter may be written, and the count to store if it is. */
export function decideCap(
  current: number,
  limit = AI_DAILY_LIMIT_PER_VISITOR,
): CapDecision {
  const count = Number.isFinite(current) && current > 0 ? Math.floor(current) : 0;
  if (count >= limit) {
    return { action: "block", storedCount: count, remaining: 0 };
  }
  const storedCount = count + 1;
  return { action: "allow", storedCount, remaining: limit - storedCount };
}

export function visitorCookie(id: string, secure: boolean): string {
  const parts = [
    `${VISITOR_COOKIE}=${id}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=31536000",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
