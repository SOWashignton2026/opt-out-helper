import { describe, expect, it } from "vitest";
import { BROKERS } from "../shared/brokers";
import { SAFETY_TIPS } from "../shared/guidance";
import { NOV13_BROKERS } from "../shared/nov-2026-brokers";
import { UPDATES, formatUpdateDate } from "../shared/whats-new";

const find = (id: string) => BROKERS.find((broker) => broker.id === id);

describe("What's New", () => {
  it("lists updates newest first with a date", () => {
    expect(UPDATES.length).toBeGreaterThan(0);
    expect(UPDATES[0].date).toBe("2026-11-13");
    expect(formatUpdateDate(UPDATES[0].date)).toBe("November 13, 2026");
    const dates = UPDATES.map((update) => update.date);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const update of UPDATES) {
      expect(update.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(update.items.length).toBeGreaterThan(0);
    }
  });
});

describe("November 13, 2026 broker update", () => {
  it("applies the must-fix links", () => {
    expect(find("searchusapeople")?.optOutUrl).toBe("https://infotracer.com/optout/");
    expect(find("anchor-computer")?.optOutUrl).toBe("https://ecom2.anchorcomputer.com/privacyrequest");
    expect(find("spydialer")?.optOutUrl).toBe("https://spydialer.com/Consumers/");
    expect(find("experian-marketing")?.optOutUrl).toBe("https://consumerprivacy.experian.com/");
    expect(find("corelogic")?.optOutUrl).toBe("https://www.cotality.com/legal/online-privacy-portal");
    expect(find("apollo")?.optOutUrl).toBe("https://www.apollo.io/company/privacy-center/");
    expect(find("apollo")?.steps.join(" ")).not.toContain("still removes the profile");
    expect(find("digital-segment")?.steps[0]).toContain("info@digitalsegment.com");
  });

  it("warns about California-only forms and card numbers", () => {
    for (const id of ["eprodirect", "snov", "youmail"]) {
      expect(find(id)?.residentsOnly, id).toMatch(/California/);
    }
    expect(find("ekata")?.warning).toMatch(/card number/);
    expect(find("claritas")?.warning).toMatch(/ID/);
  });

  it("adds the new brokers once each, with https links", () => {
    expect(NOV13_BROKERS.length).toBe(22);
    for (const broker of NOV13_BROKERS) {
      expect(BROKERS.filter((item) => item.id === broker.id).length, broker.id).toBe(1);
      expect(broker.optOutUrl.startsWith("https://"), broker.id).toBe(true);
      expect(broker.lastVerified).toBe("2026-11-13");
    }
  });

  it("has the site-wide safety tips", () => {
    const text = SAFETY_TIPS.join(" ");
    expect(text).toMatch(/California/);
    expect(text).toMatch(/fee/);
    expect(text).toMatch(/24 hours/);
    expect(text).toMatch(/listing page/);
    expect(text).toMatch(/photo ID/);
  });
});
