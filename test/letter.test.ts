import { describe, expect, it } from "vitest";
import { BROKERS } from "../shared/brokers";
import { buildLetterPrompt, LETTER_SYSTEM_PROMPT, validateLetterRequest } from "../shared/letter";
import { privacyLawFor, PRIVACY_LAWS_CHECKED } from "../shared/privacy-laws";
import { fetchWith5xxRetry } from "../shared/retry";
import { buildTemplateLetter } from "../shared/templates";

const valid = {
  letterType: "general",
  brokerId: "spokeo",
  firstName: "Ada",
  lastName: "Lovelace",
  city: "Austin",
  state: "tx",
  email: "ada@example.com",
  phone: "(512) 555-0100",
  notes: "Listing URL only.",
};

describe("letter validation", () => {
  it("accepts a normal removal request and normalizes the state", () => {
    const result = validateLetterRequest(valid, BROKERS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.state).toBe("TX");
    expect(result.broker.name).toBe("Spokeo");
  });

  it("rejects a missing name, a bad type, a long note, and a non-broker", () => {
    expect(validateLetterRequest({ ...valid, firstName: "" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, letterType: "lawsuit" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, notes: "x".repeat(401) }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, brokerId: "do-not-call" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, brokerId: "google-results-about-you" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, brokerId: "acxiom" }, BROKERS).ok).toBe(true);
    expect(validateLetterRequest({ ...valid, brokerId: "not-a-site" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, email: "not-an-email" }, BROKERS).ok).toBe(false);
    expect(validateLetterRequest({ ...valid, state: "ZZ" }, BROKERS).ok).toBe(false);
  });

  it("drops control characters and ignores extra fields", () => {
    const result = validateLetterRequest(
      { ...valid, firstName: "Ada\u0000", surprise: "nope" },
      BROKERS,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.firstName).toBe("Ada");
  });

  it("puts only provided facts in the model prompt", () => {
    const result = validateLetterRequest({ ...valid, email: "", phone: "", notes: "" }, BROKERS);
    if (!result.ok) throw new Error("expected valid");
    const prompt = buildLetterPrompt(result.value, result.broker.name);
    expect(prompt).toContain("Site: Spokeo");
    expect(prompt).toContain("Ada Lovelace");
    expect(prompt).not.toContain("Email:");
    expect(prompt).not.toContain("Phone:");
  });
});

const LAW_CITE = /CCPA|CPRA|statute|consumer privacy rights|My Health My Data|VCDPA|privacy act|privacy law/i;

describe("template fallback", () => {
  it("names the person and the site, and mentions California only for a CA privacy letter", () => {
    const base = validateLetterRequest(valid, BROKERS);
    if (!base.ok) throw new Error("expected valid");
    const general = buildTemplateLetter(base.value, "Spokeo");
    expect(general).toContain("Ada Lovelace");
    expect(general).toContain("Spokeo");
    expect(general).not.toContain("CCPA");

    const california = buildTemplateLetter(
      { ...base.value, letterType: "ccpa", state: "CA", city: "Oakland" },
      "Spokeo",
    );
    expect(california).toContain("California Consumer Privacy Act (CCPA/CPRA)");

    const followup = buildTemplateLetter({ ...base.value, letterType: "followup" }, "Spokeo");
    expect(followup.toLowerCase()).toContain("already asked");
    expect(followup).not.toMatch(LAW_CITE);
  });

  it("does not cite a law for a Washington general, follow-up, or state-privacy letter", () => {
    const base = validateLetterRequest(
      { ...valid, city: "Seattle", state: "WA", letterType: "general" },
      BROKERS,
    );
    if (!base.ok) throw new Error("expected valid");
    expect(privacyLawFor("WA")).toBeUndefined();

    const general = buildTemplateLetter(base.value, "Spokeo");
    const followup = buildTemplateLetter({ ...base.value, letterType: "followup" }, "Spokeo");
    const polite = buildTemplateLetter({ ...base.value, letterType: "ccpa" }, "Spokeo");
    for (const letter of [general, followup, polite]) {
      expect(letter).not.toMatch(LAW_CITE);
      expect(letter).not.toContain("Washington's");
    }
    expect(polite).toContain("Please delete the personal information");

    const generalPrompt = buildLetterPrompt(base.value, "Spokeo");
    const followupPrompt = buildLetterPrompt({ ...base.value, letterType: "followup" }, "Spokeo");
    const politePrompt = buildLetterPrompt({ ...base.value, letterType: "ccpa" }, "Spokeo");
    expect(generalPrompt).toContain("Do not name any statute");
    expect(followupPrompt).toContain("Do not name any statute");
    expect(politePrompt).toContain("Do not name any statute");
    expect(politePrompt).not.toContain("CCPA");
    expect(LETTER_SYSTEM_PROMPT).toContain("never cite a law");
    expect(LETTER_SYSTEM_PROMPT).not.toContain("consumer privacy rights");
  });

  it("cites the CCPA for a California state-privacy letter and no other law", () => {
    const base = validateLetterRequest(
      { ...valid, city: "Oakland", state: "CA", letterType: "ccpa" },
      BROKERS,
    );
    if (!base.ok) throw new Error("expected valid");
    expect(privacyLawFor("CA")?.name).toContain("CCPA/CPRA");
    expect(PRIVACY_LAWS_CHECKED).toBe("2026-10-20");

    const letter = buildTemplateLetter(base.value, "Spokeo");
    expect(letter).toContain("California Consumer Privacy Act (CCPA/CPRA)");
    expect(letter).not.toContain("Virginia");

    const prompt = buildLetterPrompt(base.value, "Spokeo");
    expect(prompt).toContain("You may cite only this law: California Consumer Privacy Act (CCPA/CPRA).");
    expect(prompt).not.toContain("Washington");
  });
});

describe("Groq retry", () => {
  it("retries 500 responses twice and returns the later success", async () => {
    const statuses = [500, 502, 200];
    let calls = 0;
    const result = await fetchWith5xxRetry(
      async () => {
        const status = statuses[calls] ?? 200;
        calls += 1;
        return new Response("x", { status });
      },
      "https://api.groq.com/openai/v1/chat/completions",
      { method: "POST" },
      2,
    );
    expect(result.attempts).toBe(3);
    expect(result.response.status).toBe(200);
  });

  it("does not retry a 400", async () => {
    let calls = 0;
    const result = await fetchWith5xxRetry(
      async () => {
        calls += 1;
        return new Response("no", { status: 400 });
      },
      "https://example.com",
      {},
      2,
    );
    expect(calls).toBe(1);
    expect(result.response.status).toBe(400);
  });

  it("stops after two retries when every response is a 500", async () => {
    let calls = 0;
    const result = await fetchWith5xxRetry(
      async () => {
        calls += 1;
        return new Response("down", { status: 503 });
      },
      "https://example.com",
      {},
      2,
    );
    expect(calls).toBe(3);
    expect(result.response.status).toBe(503);
  });
});
