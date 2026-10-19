import { describe, expect, it } from "vitest";
import { BROKERS, type Broker } from "../shared/brokers";
import { buildSearchUrl } from "../shared/links";
import { needsRecheck, parseSavedData, type Profile } from "../shared/progress";

const REQUIRED: (keyof Broker)[] = [
  "id",
  "name",
  "category",
  "blurb",
  "optOutUrl",
  "steps",
  "difficulty",
  "requiresEmail",
  "requiresId",
  "requiresPhone",
  "lastVerified",
  "verification",
];

const profile: Profile = {
  firstName: "John",
  lastName: "Smith",
  city: "Los Angeles",
  state: "CA",
  email: "",
  phone: "(202) 555-0100",
};

describe("broker list", () => {
  it("has the people-search sites and the call and junk tasks", () => {
    const people = BROKERS.filter((broker) => broker.category === "people-search");
    expect(people.length).toBeGreaterThanOrEqual(25);
    const urls = BROKERS.map((broker) => broker.optOutUrl);
    expect(urls).toEqual(expect.arrayContaining([
      "https://www.donotcall.gov/",
      "https://reportfraud.ftc.gov/",
      "https://consumercomplaints.fcc.gov/",
      "https://www.optoutprescreen.com/",
      "https://www.dmachoice.org/",
      "https://www.t-mobile.com/benefits/scam-shield",
      "https://www.verizon.com/solutions-and-services/call-filter/",
      "https://www.att.com/support/article/wireless/KM1147710/",
      "https://support.apple.com/en-us/111106",
      "https://support.google.com/phoneapp/answer/3459196?hl=en",
    ]));
  });

  it("uses a stable shape, unique ids, and https links", () => {
    const ids = new Set<string>();
    for (const broker of BROKERS) {
      expect(ids.has(broker.id)).toBe(false);
      ids.add(broker.id);
      expect(broker.id).toMatch(/^[a-z0-9-]{2,40}$/);
      for (const key of REQUIRED) expect(broker[key]).not.toBeUndefined();
      expect(["easy", "medium", "hard"]).toContain(broker.difficulty);
      expect(["people-search", "calls-and-junk"]).toContain(broker.category);
      expect(["ok", "blocked", "failed"]).toContain(broker.verification);
      expect(broker.optOutUrl.startsWith("https://")).toBe(true);
      expect(broker.steps.length).toBeGreaterThan(0);
      expect(typeof broker.requiresEmail).toBe("boolean");
      expect(typeof broker.requiresId).toBe("boolean");
      expect(typeof broker.requiresPhone).toBe("boolean");
      if (broker.verification === "failed") {
        expect(broker.lastVerified).toBeNull();
      } else {
        expect(broker.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      for (const template of [broker.searchUrlTemplate, broker.phoneSearchUrl]) {
        if (template) expect(template.startsWith("https://")).toBe(true);
      }
    }
  });

  it("flags the links that did not check out", () => {
    const failed = BROKERS.filter((broker) => broker.verification === "failed").map((broker) => broker.id);
    expect(failed.sort()).toEqual([
      "clustrmaps",
      "nuwber",
      "peekyou",
      "publicdatausa",
      "radaris",
      "zabasearch",
    ]);
  });

  it("builds a Spokeo search link and phone lookups", () => {
    const spokeo = BROKERS.find((broker) => broker.id === "spokeo");
    expect(buildSearchUrl(spokeo?.searchUrlTemplate ?? "", profile)).toBe(
      "https://www.spokeo.com/John-Smith/California/Los-Angeles",
    );
    const phoneSites = ["spokeo", "whitepages", "usphonebook"];
    for (const id of phoneSites) {
      const broker = BROKERS.find((item) => item.id === id);
      expect(broker?.phoneSearchUrl).toBeTruthy();
    }
    const book = BROKERS.find((broker) => broker.id === "usphonebook");
    expect(buildSearchUrl(book?.phoneSearchUrl ?? "", profile)).toBe("https://www.usphonebook.com/2025550100");
    expect(buildSearchUrl(book?.phoneSearchUrl ?? "", { ...profile, phone: "" })).toBeNull();
  });
});

describe("saved progress", () => {
  it("accepts a backup and ignores broken rows", () => {
    const saved = parseSavedData({
      version: 1,
      profile: { firstName: "Ada", lastName: "Lovelace", city: "Austin", state: "tx", email: "", phone: "" },
      progress: {
        spokeo: { status: "removed", updatedAt: "2026-01-01T00:00:00.000Z" },
        bad: { status: "nope", updatedAt: null },
      },
    });
    expect(saved?.profile.state).toBe("TX");
    expect(saved?.progress.spokeo?.status).toBe("removed");
    expect(saved?.progress.bad).toBeUndefined();
    expect(parseSavedData({ version: 2 })).toBeNull();
  });

  it("asks for a recheck 90 days after an update", () => {
    const now = Date.parse("2026-10-19T00:00:00.000Z");
    expect(needsRecheck({ status: "removed", updatedAt: "2026-07-01T00:00:00.000Z" }, now)).toBe(true);
    expect(needsRecheck({ status: "removed", updatedAt: "2026-10-01T00:00:00.000Z" }, now)).toBe(false);
    expect(needsRecheck({ status: "not_started", updatedAt: "2020-01-01T00:00:00.000Z" }, now)).toBe(false);
  });
});
