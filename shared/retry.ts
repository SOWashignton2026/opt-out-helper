export async function fetchWith5xxRetry(
  doFetch: typeof fetch,
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<{ response: Response; attempts: number }> {
  let response: Response | null = null;
  let attempts = 0;
  const total = Math.max(0, retries);
  while (attempts <= total) {
    attempts += 1;
    response = await doFetch(url, init);
    if (response.status < 500 || attempts > total) break;
    await response.arrayBuffer().catch(() => undefined);
  }
  if (!response) {
    throw new Error("Fetch was not attempted");
  }
  return { response, attempts };
}
