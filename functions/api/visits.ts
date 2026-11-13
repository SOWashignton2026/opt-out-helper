import { API_CSP, securityHeaders } from "../../shared/security";
import { addVisit, readTotal } from "../../shared/visits";

type VisitsEnv = { VISITS?: KVNamespace };

/**
 * GET  /api/visits  -> { total }
 * POST /api/visits  -> adds one, then { total }
 *
 * Stores one number only. This function never reads or stores cookies, IP
 * addresses, user agents, or anything else about the visitor, and it does not log.
 */
function json(body: unknown, status: number): Response {
  const headers = new Headers(securityHeaders(API_CSP));
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export const onRequest: PagesFunction<VisitsEnv> = async ({ request, env }) => {
  const store = env.VISITS;
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!store) return json({ total: null }, 503);
  try {
    if (request.method === "GET") return json({ total: await readTotal(store) }, 200);
    if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
    return json({ total: await addVisit(store) }, 200);
  } catch {
    return json({ total: null }, 503);
  }
};
