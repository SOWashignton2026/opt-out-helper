import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANNUAL_CREDIT_REPORT_URL,
  EQUIFAX_MAIL,
  EQUIFAX_PHONE,
  EXPERIAN_PHONE,
  TRANSUNION_PHONE,
} from "../shared/credit-freeze";

const page = readFileSync(new URL("../src/pages/CreditFreeze.tsx", import.meta.url), "utf8");
const cards = readFileSync(new URL("../shared/more-brokers.ts", import.meta.url), "utf8");

describe("credit freeze guide", () => {
  it("keeps the verified bureau facts and leaves out unchecked ones", () => {
    expect(EQUIFAX_PHONE).toBe("1-888-298-0045");
    expect(EXPERIAN_PHONE).toBe("1-888-397-3742");
    expect(TRANSUNION_PHONE).toBe("1-800-916-8800");
    expect(EQUIFAX_MAIL).toContain("P.O. Box 105788");
    expect(ANNUAL_CREDIT_REPORT_URL).toBe("https://www.annualcreditreport.com/");
    const combined = `${page}\n${cards}`;
    for (const missing of ["888-909-8872", "909-8872", "844-545-5640", "888-378-4329", "consumer.ftc.gov/articles/credit-freezes"]) {
      expect(combined).not.toContain(missing);
    }
    expect(page).toContain("USA.gov");
    expect(page).toContain("$84,000");
    expect(page).toContain("Equifax's minor freeze form");
  });
});
