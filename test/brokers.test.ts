import { describe, expect, it } from "vitest";
import {
  BROKERS,
  FILTER_LABELS,
  PEOPLE_CONNECT_OPTOUT,
  RESOURCE_IDS,
  SPAM_CALL_IDS,
  STATE_LIMITED_IDS,
  parseToolFilter,
  type Broker,
} from "../shared/brokers";
import { PRIVACY_BOT_TEMPLATE_URL, buildSearchUrl, privacyBotTemplateHref, searchMeHref, selfSearchUrl } from "../shared/links";
import { parseSavedData, type Profile } from "../shared/progress";
import { parseStep, stepHrefs } from "../shared/steps";

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
  "letterRecommended",
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
      expect(["people-search", "spam", "marketing", "search"]).toContain(broker.category);
      expect(["ok", "blocked", "failed"]).toContain(broker.verification);
      expect(broker.optOutUrl.startsWith("https://")).toBe(true);
      expect(broker.steps.length).toBeGreaterThan(0);
      expect(typeof broker.requiresEmail).toBe("boolean");
      expect(typeof broker.requiresId).toBe("boolean");
      expect(typeof broker.requiresPhone).toBe("boolean");
      expect(typeof broker.letterRecommended).toBe("boolean");
      if (broker.verification === "failed") {
        expect(broker.lastVerified).toBeNull();
      } else {
        expect(broker.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      for (const template of [broker.searchUrlTemplate, broker.phoneSearchUrl, broker.homeUrl]) {
        if (template) expect(template.startsWith("https://")).toBe(true);
      }
      if (broker.linkNotVerified) {
        expect(broker.verification).toBe("failed");
        expect(broker.lastVerified).toBeNull();
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
    expect(BROKERS.filter((broker) => broker.linkNotVerified)).toEqual([]);
  });

  it("links every named form or page, including Spokeo's opt-out form", () => {
    const spokeo = BROKERS.find((broker) => broker.id === "spokeo");
    const spokeoStep = spokeo?.steps.find((step) => step.includes("opt-out form")) ?? "";
    expect(parseStep(spokeoStep)).toEqual([
      { kind: "text", text: "Paste it into the " },
      { kind: "link", text: "opt-out form", href: "https://www.spokeo.com/optout" },
      { kind: "text", text: " with an email you can open." },
    ]);

    for (const broker of BROKERS) {
      const hrefs = broker.steps.flatMap(stepHrefs);
      expect(hrefs, broker.id).toContain(broker.optOutUrl);
      for (const step of broker.steps) {
        const leftover = step.replace(/\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)/g, "");
        expect(leftover, `${broker.id}: ${step}`).not.toMatch(/https?:\/\/|mailto:/);
        for (const href of stepHrefs(step)) {
          expect(href.startsWith("https://") || href.startsWith("mailto:")).toBe(true);
        }
      }
    }
  });

  it("recommends a letter only when a written request is the route", () => {
    const flagged = BROKERS.filter((broker) => broker.letterRecommended).map((broker) => broker.id);
    expect(flagged).toEqual(["mylife", "acxiom"]);
    const spokeo = BROKERS.find((broker) => broker.id === "spokeo");
    expect(spokeo?.letterRecommended).toBe(false);
    for (const broker of BROKERS) {
      if (broker.category === "spam" || broker.category === "search") {
        expect(broker.letterRecommended).toBe(false);
      }
    }
    expect(BROKERS.find((broker) => broker.id === "acxiom")?.category).toBe("marketing");
  });

  it("keeps every former spam and resources item as a Privacy Tool card", () => {
    const spam = BROKERS.filter((broker) => broker.category === "spam").map((broker) => broker.id);
    const listed = [...SPAM_CALL_IDS, ...RESOURCE_IDS];
    for (const id of listed) expect(spam).toContain(id);
    expect(new Set(listed).size).toBe(listed.length);
    expect(SPAM_CALL_IDS).toEqual(["do-not-call", "ftc-unwanted-calls", "fcc-complaint"]);
    expect(RESOURCE_IDS).toEqual([
      "dmachoice",
      "optoutprescreen",
      "tmobile-scam-shield",
      "verizon-call-filter",
      "att-activearmor",
      "iphone-silence-unknown",
      "android-spam-protection",
    ]);
    const optOut = BROKERS.find((broker) => broker.id === "optoutprescreen");
    expect(optOut?.steps.join(" ")).toContain("1-888-567-8688");
    const dma = BROKERS.find((broker) => broker.id === "dmachoice");
    expect(dma?.steps.join(" ")).toContain("about $6");
  });

  it("uses the checked opt-out addresses and marks state-limited sites", () => {
    expect(BROKERS.find((broker) => broker.id === "whitepages")?.optOutUrl).toBe(
      "https://www.whitepages.com/suppression-requests",
    );
    for (const id of ["intelius", "truthfinder", "instant-checkmate", "us-search", "addresses"]) {
      const broker = BROKERS.find((item) => item.id === id);
      expect(broker?.optOutUrl).toBe(PEOPLE_CONNECT_OPTOUT);
      expect(broker?.steps.join(" ")).toContain("One PeopleConnect opt-out covers");
    }
    const limited = BROKERS.filter((broker) => broker.stateLimited).map((broker) => broker.id);
    expect(limited.slice().sort()).toEqual([...STATE_LIMITED_IDS].slice().sort());
    expect(BROKERS.find((broker) => broker.id === "google-results-about-you")?.category).toBe("search");
    expect(BROKERS.find((broker) => broker.id === "equifax-marketing")?.category).toBe("marketing");
    expect(BROKERS.find((broker) => broker.id === "corelogic")?.optOutUrl).toBe(
      "https://www.cotality.com/legal/privacy-policy",
    );
    expect(BROKERS.find((broker) => broker.id === "corelogic")?.steps.join(" ")).toContain("privacy@cotality.com");
  });

  it("shows a search link only when the site has a real lookup address", () => {
    const hidden = [
      "google-results-about-you",
      "acxiom",
      "equifax-marketing",
      "lexisnexis",
      "data-axle",
      "epsilon",
      "experian-marketing",
      "corelogic",
      "deep-sync",
      "do-not-call",
      "ftc-unwanted-calls",
      "fcc-complaint",
      "optoutprescreen",
      "dmachoice",
      "tmobile-scam-shield",
      "verizon-call-filter",
      "att-activearmor",
      "iphone-silence-unknown",
      "android-spam-protection",
      "pipl",
      "people-data-labs",
      "transunion-marketing",
      "porch-group-media",
      "l2",
      "ufind",
      "privatenumberchecker",
      "realeflow",
      "amerilist",
      "versium",
      "atdata",
      "statsocial",
      "valassis",
      "apollo",
      "uplead",
      "propertyreach",
    ];
    for (const id of hidden) {
      const broker = BROKERS.find((item) => item.id === id);
      expect(broker, id).toBeTruthy();
      expect(selfSearchUrl(broker ?? { optOutUrl: "https://example.com/" }, profile), id).toBeNull();
    }
    const spokeo = BROKERS.find((broker) => broker.id === "spokeo");
    expect(selfSearchUrl(spokeo ?? { optOutUrl: "https://example.com/" }, profile)).toContain("spokeo.com");
    const bug = BROKERS.find((broker) => broker.id === "searchbug");
    expect(selfSearchUrl(bug ?? { optOutUrl: "https://example.com/" }, profile)).toBe(
      "https://www.searchbug.com/peoplefinder/",
    );
    expect(bug?.category).toBe("people-search");
    expect(BROKERS.find((broker) => broker.id === "pipl")?.category).toBe("people-search");
    for (const id of ["people-data-labs", "transunion-marketing", "porch-group-media", "l2"]) {
      expect(BROKERS.find((broker) => broker.id === id)?.category).toBe("marketing");
    }
    expect(BROKERS.find((broker) => broker.id === "transunion-marketing")?.steps.join(" ")).toContain("866-310-8783");
    const withSearch = [
      "searchbug",
      "sync-me",
      "spydialer",
      "privatereports",
      "peoplesearcher",
      "weinform",
      "truthrecord",
      "courtrecords-us",
      "recordsfinder",
      "staterecords",
      "searchquarry",
      "propertychecker",
      "courtcasefinder",
    ];
    for (const id of withSearch) {
      expect(selfSearchUrl(BROKERS.find((broker) => broker.id === id) ?? { optOutUrl: "https://example.com/" }, profile), id).toMatch(/^https:\/\//);
    }
    expect(BROKERS.find((broker) => broker.id === "sync-me")?.steps.join(" ")).toContain("Daniel's Law");
    expect(BROKERS.find((broker) => broker.id === "valassis")?.category).toBe("spam");
    for (const id of ["courtrecords-us", "recordsfinder", "staterecords", "searchquarry", "propertychecker", "courtcasefinder"]) {
      expect(BROKERS.find((broker) => broker.id === id)?.stateLimited).toBe(true);
    }
    expect(BROKERS.some((broker) => broker.id === "stirista" || broker.name.startsWith("DROPPED"))).toBe(false);
  });

  it("reads the Privacy Tool filter from the address", () => {
    expect(parseToolFilter("spam")).toBe("spam");
    expect(parseToolFilter("calls-and-junk")).toBe("spam");
    expect(parseToolFilter("marketing")).toBe("marketing");
    expect(parseToolFilter("search")).toBe("search");
    expect(parseToolFilter("people")).toBe("people-search");
    expect(parseToolFilter("nope")).toBe("all");
    expect(FILTER_LABELS.spam).toBe("Spam Calls & Junk Mail");
    expect(FILTER_LABELS["people-search"]).toBe("People-Search Sites");
    expect(FILTER_LABELS.marketing).toBe("Marketing Data Brokers");
    expect(FILTER_LABELS.search).toBe("Search Engines");
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
    expect(searchMeHref(book ?? { optOutUrl: "https://example.com/" }, profile)).toBe(
      "https://www.usphonebook.com/john-smith",
    );
    const intelius = BROKERS.find((broker) => broker.id === "intelius");
    expect(searchMeHref(intelius ?? { optOutUrl: "https://example.com/" }, profile)).toBe(
      "https://www.intelius.com/",
    );
    const bare = { optOutUrl: "https://example.com/opt-out" };
    expect(searchMeHref(bare, profile)).toBe("https://example.com/");
  });

  it("shows the Privacy Bot template only when the link is set", () => {
    expect(PRIVACY_BOT_TEMPLATE_URL).toBe("https://x.ai/bot/m8LgFBTwlCWHQvVMy77z_");
    expect(privacyBotTemplateHref()).toBe(PRIVACY_BOT_TEMPLATE_URL);
    expect(privacyBotTemplateHref("")).toBeNull();
    expect(privacyBotTemplateHref("  ")).toBeNull();
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
    expect(saved?.progress.spokeo).toEqual({ status: "removed" });
    expect(saved?.progress.spokeo).not.toHaveProperty("updatedAt");
    expect(saved?.progress.bad).toBeUndefined();
    expect(parseSavedData({ version: 2 })).toBeNull();
  });
});
