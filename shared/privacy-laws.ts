/**
 * Comprehensive U.S. consumer privacy laws that include a right to delete
 * personal information, and that are in effect.
 *
 * Checked 2026-10-20. Count follows the IAPP / Future of Privacy Forum
 * approach: a generally applicable consumer privacy statute with individual
 * rights. Nineteen laws are in effect. Sources for the 2026 effective dates
 * include the IAPP's 5 Jan 2026 note (Indiana, Kentucky, and Rhode Island
 * on 1 Jan 2026) and published trackers current through 1 Oct 2026.
 *
 * Left off on purpose:
 * - Florida's Digital Bill of Rights. It is in effect, but its main duties
 *   apply only to companies above $1 billion in global revenue.
 * - Signed laws that are not in effect yet: Oklahoma and Louisiana
 *   (1 Jan 2027), Alabama (1 May 2027), Vermont (1 Jan 2028).
 * - Sectoral laws. Washington's My Health My Data Act covers health data
 *   only, not a general deletion right.
 * - Sale-only opt-out laws, such as Nevada's.
 *
 * Iowa's deletion right is narrower than most: it covers personal data the
 * consumer provided. It is still a deletion right in a comprehensive law.
 *
 * Edit this list when a law takes effect or is repealed.
 */
export const PRIVACY_LAWS_CHECKED = "2026-10-20";

export type PrivacyLaw = {
  state: string;
  /** Name to use if a letter cites the law. One law per state. */
  name: string;
};

export const PRIVACY_LAWS: PrivacyLaw[] = [
  { state: "CA", name: "California Consumer Privacy Act (CCPA/CPRA)" },
  { state: "CO", name: "Colorado Privacy Act" },
  { state: "CT", name: "Connecticut Data Privacy Act" },
  { state: "DE", name: "Delaware Personal Data Privacy Act" },
  { state: "IA", name: "Iowa Consumer Data Protection Act" },
  { state: "IN", name: "Indiana Consumer Data Protection Act" },
  { state: "KY", name: "Kentucky Consumer Data Protection Act" },
  { state: "MD", name: "Maryland Online Data Privacy Act" },
  { state: "MN", name: "Minnesota Consumer Data Privacy Act" },
  { state: "MT", name: "Montana Consumer Data Privacy Act" },
  { state: "NE", name: "Nebraska Data Privacy Act" },
  { state: "NH", name: "New Hampshire Data Privacy Act" },
  { state: "NJ", name: "New Jersey Data Privacy Act" },
  { state: "OR", name: "Oregon Consumer Privacy Act" },
  { state: "RI", name: "Rhode Island Data Transparency and Privacy Protection Act" },
  { state: "TN", name: "Tennessee Information Protection Act" },
  { state: "TX", name: "Texas Data Privacy and Security Act" },
  { state: "UT", name: "Utah Consumer Privacy Act" },
  { state: "VA", name: "Virginia Consumer Data Protection Act" },
];

export function privacyLawFor(state: string): PrivacyLaw | undefined {
  const code = state.trim().toUpperCase();
  return PRIVACY_LAWS.find((law) => law.state === code);
}
