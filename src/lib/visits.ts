import { useEffect, useState } from "react";
import { VISITS_PATH, claimSessionVisit } from "../../shared/visits";

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

let pending: Promise<number | null> | null = null;

/** Counts this browser session once (POST), otherwise just reads the total (GET). Same-origin only, no cookies. */
function loadTotal(): Promise<number | null> {
  if (pending) return pending;
  const count = claimSessionVisit(sessionStore());
  pending = fetch(VISITS_PATH, {
    method: count ? "POST" : "GET",
    credentials: "omit",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const body = (await response.json()) as { total?: unknown };
      return typeof body.total === "number" ? body.total : null;
    })
    .catch(() => null);
  return pending;
}

export function useVisitTotal(): number | null {
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    void loadTotal().then((value) => {
      if (live) setTotal(value);
    });
    return () => {
      live = false;
    };
  }, []);
  return total;
}
