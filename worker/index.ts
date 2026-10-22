import { decideCap, hashVisitorId, isVisitorCookie, parseDailyLimit, readCookie, selectVisitorMaterial, usageKey, utcDateKey, VISITOR_COOKIE, visitorCookie } from "../shared/cap";
import { BROKERS } from "../shared/brokers";
import { buildLetterPrompt, LETTER_LIMITS, LETTER_SYSTEM_PROMPT, validateLetterRequest } from "../shared/letter";
import { fetchWith5xxRetry } from "../shared/retry";
import { API_CSP, PAGE_CSP, securityHeaders } from "../shared/security";
import { buildTemplateLetter } from "../shared/templates";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
function capMessage(limit: number): string {
  return `You've used today's ${limit} AI letters — use the template below or come back tomorrow.`;
}

function mockEnabled(value: string): boolean {
  return value === "true";
}

function applySecurity(response: Response, csp: string): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders(csp))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/** Outcome only. Never log the letter, the prompt, or the visitor's name, email, phone, or notes. */
function log(fields: Record<string, string | number | boolean>): void {
  console.log(JSON.stringify(fields));
}

function json(body: unknown, status: number, extra: HeadersInit = {}): Response {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return applySecurity(new Response(JSON.stringify(body), { status, headers }), API_CSP);
}

function withCookie(response: Response, request: Request, cookieId: string | null): Response {
  if (!cookieId) return response;
  const headers = new Headers(response.headers);
  const secure = new URL(request.url).protocol === "https:";
  headers.append("Set-Cookie", visitorCookie(cookieId, secure));
  return new Response(response.body, { status: response.status, headers });
}

function originAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function newVisitorId(): string {
  return crypto.randomUUID();
}

async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  const declared = request.headers.get("Content-Length");
  if (declared && Number(declared) > LETTER_LIMITS.bodyBytes) {
    return { ok: false, error: "That request is too long." };
  }
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > LETTER_LIMITS.bodyBytes) {
    return { ok: false, error: "That request is too long." };
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(buffer)) };
  } catch {
    return { ok: false, error: "Send valid JSON." };
  }
}

function letterText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 8000) return null;
  return trimmed;
}

async function reserveCredit(
  env: Env,
  key: string,
  limit: number,
): Promise<{ allowed: true; remaining: number } | { allowed: false; remaining: 0 }> {
  const existing = await env.AI_USAGE.get(key);
  const current = existing ? Number(existing) : 0;
  const decision = decideCap(Number.isFinite(current) ? current : 0, limit);
  if (decision.action === "block") return { allowed: false, remaining: 0 };
  await env.AI_USAGE.put(key, String(decision.storedCount), { expirationTtl: 60 * 60 * 48 });
  return { allowed: true, remaining: decision.remaining };
}

async function refundCredit(env: Env, key: string): Promise<void> {
  const existing = await env.AI_USAGE.get(key);
  const current = existing ? Number(existing) : 0;
  const next = Number.isFinite(current) && current > 0 ? Math.floor(current) - 1 : 0;
  await env.AI_USAGE.put(key, String(next), { expirationTtl: 60 * 60 * 48 });
}

async function writeWithGroq(env: Env, prompt: string): Promise<{ ok: true; letter: string; attempts: number } | { ok: false; status: number; attempts: number }> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, status: 0, attempts: 0 };
  const init: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 0.3,
      messages: [
        { role: "system", content: LETTER_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  };
  const { response, attempts } = await fetchWith5xxRetry(fetch, GROQ_URL, init, 2);
  if (!response.ok) {
    await response.arrayBuffer().catch(() => undefined);
    return { ok: false, status: response.status, attempts };
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, status: response.status, attempts };
  }
  const letter = letterText(payload);
  if (!letter) return { ok: false, status: response.status, attempts };
  return { ok: true, letter, attempts };
}

async function handleLetter(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method", message: "Use POST." }, 405);
  }
  if (!originAllowed(request)) {
    return json({ error: "origin", message: "Open this page on the same site and try again." }, 403);
  }
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "type", message: "Send JSON." }, 415);
  }

  const existingCookie = readCookie(request.headers.get("Cookie"), VISITOR_COOKIE);
  const validCookie = isVisitorCookie(existingCookie) ? existingCookie : null;
  // A missing or junk cookie still gets a new id for next time. This request
  // counts against the IP until the browser actually sends the cookie back.
  const minted = validCookie ? null : newVisitorId();
  const material = selectVisitorMaterial(validCookie, request.headers.get("CF-Connecting-IP"));
  const hashed = await hashVisitorId(material.material);
  const key = usageKey(hashed, utcDateKey());
  const limit = parseDailyLimit(env.AI_DAILY_LIMIT_PER_VISITOR);

  const parsed = await readJson(request);
  if (!parsed.ok) {
    return withCookie(json({ error: "validation", message: parsed.error }, 400), request, minted);
  }
  const validated = validateLetterRequest(parsed.value, BROKERS);
  if (!validated.ok) {
    return withCookie(json({ error: "validation", message: validated.error }, 400), request, minted);
  }

  let reserved: { allowed: true; remaining: number } | { allowed: false; remaining: 0 };
  try {
    reserved = await reserveCredit(env, key, limit);
  } catch (error) {
    log({
      message: "letter",
      outcome: "cap_store_error",
      brokerId: validated.value.brokerId,
      letterType: validated.value.letterType,
      error: error instanceof Error ? error.name : "error",
    });
    return withCookie(
      json(
        {
          error: "unavailable",
          message: "The daily letter counter is unavailable. Use the template below.",
        },
        503,
      ),
      request,
      minted,
    );
  }

  if (!reserved.allowed) {
    log({
      message: "letter",
      outcome: "cap",
      brokerId: validated.value.brokerId,
      letterType: validated.value.letterType,
      visitor: material.source,
    });
    return withCookie(
      json({ error: "cap", message: capMessage(limit), remaining: 0 }, 429),
      request,
      minted,
    );
  }

  const prompt = buildLetterPrompt(validated.value, validated.broker.name);
  try {
    if (mockEnabled(env.MOCK_GROQ)) {
      log({
        message: "letter",
        outcome: "mock",
        brokerId: validated.value.brokerId,
        letterType: validated.value.letterType,
        visitor: material.source,
      });
      return withCookie(
        json(
          {
            letter: buildTemplateLetter(validated.value, validated.broker.name),
            source: "mock",
            remaining: reserved.remaining,
          },
          200,
        ),
        request,
        minted,
      );
    }

    const result = await writeWithGroq(env, prompt);
    if (!result.ok) {
      await refundCredit(env, key).catch(() => undefined);
      log({
        message: "letter",
        outcome: result.status === 0 ? "not_configured" : "groq_error",
        brokerId: validated.value.brokerId,
        letterType: validated.value.letterType,
        groqStatus: result.status,
        attempts: result.attempts,
        visitor: material.source,
      });
      const message =
        result.status === 0
          ? "The AI helper is not set up yet. Use the template below."
          : "The AI helper did not answer. Use the template below.";
      return withCookie(
        json({ error: "ai", message, remaining: Math.min(limit, reserved.remaining + 1) }, 502),
        request,
        minted,
      );
    }

    log({
      message: "letter",
      outcome: "ok",
      brokerId: validated.value.brokerId,
      letterType: validated.value.letterType,
      attempts: result.attempts,
      visitor: material.source,
    });
    return withCookie(
      json({ letter: result.letter, source: "ai", remaining: reserved.remaining }, 200),
      request,
      minted,
    );
  } catch (error) {
    await refundCredit(env, key).catch(() => undefined);
    log({
      message: "letter",
      outcome: "exception",
      brokerId: validated.value.brokerId,
      letterType: validated.value.letterType,
      error: error instanceof Error ? error.name : "error",
    });
    return withCookie(
      json({ error: "ai", message: "The AI helper did not answer. Use the template below." }, 502),
      request,
      minted,
    );
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/letter") {
      try {
        return await handleLetter(request, env);
      } catch (error) {
        log({
          message: "letter",
          outcome: "unhandled",
          error: error instanceof Error ? error.name : "error",
        });
        return json({ error: "server", message: "Something went wrong. Use the template below." }, 500);
      }
    }
    return applySecurity(await env.ASSETS.fetch(request), PAGE_CSP);
  },
} satisfies ExportedHandler<Env>;
