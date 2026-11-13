/**
 * Cards added November 13, 2026 from the Privacy bot's replies and form work
 * (Oct 23 to Nov 12, 2026). Each link came from the company itself (a reply
 * email or its own page) and was opened again on Nov 13, 2026.
 *
 * verification ok: the page loaded on Nov 13. blocked: the page answered our
 * automated check with a security screen, but it is the address the company sent.
 */
import type { Broker, Category, Difficulty, Verification } from "./brokers";

export const NOV13_ADDED = "2026-11-13";

type Seed = {
  id: string;
  name: string;
  category: Category;
  blurb: string;
  optOutUrl: string;
  homeUrl?: string;
  email?: string;
  steps: string[];
  difficulty?: Difficulty;
  requiresEmail?: boolean;
  requiresId?: boolean;
  requiresPhone?: boolean;
  letterRecommended?: boolean;
  verification?: Verification;
  residentsOnly?: string;
  warning?: string;
  notes: string;
};

function card(seed: Seed): Broker {
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    blurb: seed.blurb,
    optOutUrl: seed.optOutUrl,
    ...(seed.homeUrl ? { homeUrl: seed.homeUrl } : {}),
    ...(seed.email ? { email: seed.email } : {}),
    steps: seed.steps,
    difficulty: seed.difficulty ?? "medium",
    requiresEmail: seed.requiresEmail ?? true,
    requiresId: seed.requiresId ?? false,
    requiresPhone: seed.requiresPhone ?? false,
    letterRecommended: seed.letterRecommended ?? false,
    lastVerified: NOV13_ADDED,
    verification: seed.verification ?? "ok",
    ...(seed.residentsOnly ? { residentsOnly: seed.residentsOnly } : {}),
    ...(seed.warning ? { warning: seed.warning } : {}),
    notes: seed.notes,
  };
}

function mail(address: string): string {
  return `[${address}](mailto:${address})`;
}

const BLOCKED_OPEN = "A security check stopped our automated visit. This is still the address the company sent.";

export const NOV13_BROKERS: Broker[] = [
  // People-search and phone-lookup sites
  card({
    id: "peoplewhiz",
    name: "PeopleWhiz",
    category: "people-search",
    blurb: "People-search site. Use its opt-out page.",
    optOutUrl: "https://www.peoplewhiz.com/optout",
    homeUrl: "https://www.peoplewhiz.com/",
    steps: [
      `Open the PeopleWhiz opt-out page in your browser. ${BLOCKED_OPEN}`,
      "Search your name and pick the listing that is you.",
      "Submit the form with an email you can open.",
      "Click the confirmation link if they send one.",
    ],
    difficulty: "easy",
    verification: "blocked",
    notes: "Address from PeopleWhiz's Nov 6, 2026 reply. It showed a Cloudflare check to our automated visit on Nov 13.",
  }),
  card({
    id: "reversephone",
    name: "ReversePhone",
    category: "people-search",
    blurb: "Reverse phone lookup. Use its opt-out search to remove your number.",
    optOutUrl: "https://www.reversephone.com/svc/optout/search/optouts",
    homeUrl: "https://www.reversephone.com/",
    steps: [
      `Open the ReversePhone opt-out page in your browser. ${BLOCKED_OPEN}`,
      "Search your phone number or name and pick the listing that is you.",
      "Submit the request with an email you can open.",
      "Click the confirmation link if they send one.",
    ],
    difficulty: "easy",
    requiresPhone: true,
    verification: "blocked",
    notes: "Address from ReversePhone's Nov 9, 2026 reply. It showed a Cloudflare check to our automated visit on Nov 13.",
  }),
  card({
    id: "callersmart",
    name: "CallerSmart",
    category: "people-search",
    blurb: "Caller-ID and phone lookup site. Enter your phone and email on its data page.",
    optOutUrl: "https://www.callersmart.com/data",
    homeUrl: "https://www.callersmart.com/",
    steps: [
      `Open the CallerSmart data page in your browser. ${BLOCKED_OPEN}`,
      "Enter your phone number and an email you can open.",
      "Click the confirmation link soon. These links can expire.",
    ],
    difficulty: "easy",
    requiresPhone: true,
    verification: "blocked",
    notes: "Address from CallerSmart's Nov 9, 2026 reply. It showed a Cloudflare check to our automated visit on Nov 13.",
  }),
  card({
    id: "callapp",
    name: "CallApp",
    category: "people-search",
    blurb: "Caller-ID app that shows names for phone numbers. You can unlist your number or email them.",
    optOutUrl: "https://callapp.com/support/can-i-wipe-my-information-from-callapp-2",
    homeUrl: "https://callapp.com/",
    email: "support@callapp.com",
    steps: [
      "Open CallApp's help page and follow the link to its unlisting page. Enter your number to unlist it.",
      `To delete your information, email ${mail("support@callapp.com")}. Their privacy policy names this address for deletion.`,
      "CallApp deletes by phone number. When they reply, they may ask for each full number with the country code, such as +1 for the US.",
      "Save their reply.",
    ],
    difficulty: "easy",
    requiresPhone: true,
    letterRecommended: true,
    notes: "Help page and support@callapp.com loaded on Nov 13, 2026. The phone-number reply is from the Privacy bot, Nov 11, 2026.",
  }),
  card({
    id: "national-public-data",
    name: "National Public Data",
    category: "people-search",
    blurb: "Background-data company. Use its opt-out page.",
    optOutUrl: "https://nationalpublicdata.com/optout.html",
    homeUrl: "https://nationalpublicdata.com/",
    steps: [
      `Open the National Public Data opt-out page in your browser. ${BLOCKED_OPEN}`,
      "Enter the details the form asks for. Do not give a Social Security number.",
      "Submit it and save the confirmation.",
    ],
    verification: "blocked",
    notes: "Address from the Nov 6, 2026 reply. It showed a Cloudflare check to our automated visit on Nov 13.",
  }),
  card({
    id: "public-record-reports",
    name: "Public Record Reports",
    category: "people-search",
    blurb: "Public-record site. Use its privacy-requests help page.",
    optOutUrl: "https://www.publicrecordreports.com/help-center/privacy-requests",
    homeUrl: "https://www.publicrecordreports.com/",
    steps: [
      "Open the Public Record Reports privacy-requests page.",
      "Follow the opt-out or deletion steps for the listing that is you.",
      "Use an email you can open and click the confirmation link if they send one.",
    ],
    notes: "Address from the Nov 6, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "public-info-services",
    name: "Public Information Services",
    category: "people-search",
    blurb: "Public-record site. Use its privacy-requests help page.",
    optOutUrl: "https://www.publicinfoservices.com/help-center/privacy-requests",
    homeUrl: "https://www.publicinfoservices.com/",
    steps: [
      "Open the Public Information Services privacy-requests page.",
      "Follow the opt-out or deletion steps for the listing that is you.",
      "Use an email you can open and click the confirmation link if they send one.",
    ],
    notes: "Address from the Nov 7-8, 2026 replies. The page loaded on Nov 13.",
  }),
  card({
    id: "nj-property-records",
    name: "NJ Property Records",
    category: "people-search",
    blurb: "Property-record site. Use the redaction page if a listing shows you.",
    optOutUrl: "https://www.njpropertyrecords.com/redaction",
    homeUrl: "https://www.njpropertyrecords.com/",
    steps: [
      "Open the NJ Property Records redaction page.",
      "Find the record that is you and ask them to redact it.",
      "Use an email you can open and click the confirmation link if they send one.",
    ],
    notes: "Address from the Nov 7-8, 2026 replies. The page loaded on Nov 13.",
  }),

  // Marketing and data companies
  card({
    id: "claritas",
    name: "Claritas",
    category: "marketing",
    blurb: "Marketing-data company. Uses an online request form.",
    optOutUrl:
      "https://privacyportal.onetrust.com/webform/68582716-6ce4-4f6e-bf08-78371b5f3292/6c7dc52d-0e2b-481f-9256-0755179e3783",
    homeUrl: "https://claritas.com/",
    steps: [
      "Open the Claritas request form.",
      "Ask them to delete your information and opt you out of its sale.",
      "The form may ask you to upload a photo ID or a utility bill. You do not have to. Upload one only if you choose to.",
      "Click the confirmation link if they send one.",
    ],
    requiresId: true,
    warning: "This form asked for an ID or utility-bill upload. That is your choice. You can skip it.",
    notes: "Form from Claritas's Nov 6, 2026 reply. The ID or utility-bill request was seen Nov 9. The page loaded on Nov 13.",
  }),
  card({
    id: "adstra",
    name: "Adstra",
    category: "marketing",
    blurb: "Marketing-data company. Uses an online request form.",
    optOutUrl:
      "https://privacyportal.onetrust.com/webform/3d2d5e0c-bd98-46b8-906c-ede68a6f6a80/2320a36e-c9e8-427d-b431-f77dede03ef3",
    steps: [
      "Open the Adstra request form.",
      "Ask them to delete your information and opt you out of its sale.",
      "Submit it with an email you can open and click the confirmation link if they send one.",
    ],
    notes: "Form from Adstra's Nov 6, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "affinity-solutions",
    name: "Affinity Solutions",
    category: "marketing",
    blurb: "Purchase-data company. Uses an online request form.",
    optOutUrl:
      "https://affinitysolutions-privacy.my.onetrust.com/webform/a564cfa1-53bf-4c10-bf95-cd907432d7e8/7e4e6bf3-6562-454e-8c73-6a7bd1f4b336",
    steps: [
      "Open the Affinity Solutions request form.",
      "Fill in your name and contact details. An email address alone was not accepted.",
      "They send a validation email afterward. Click that link or the request does not go through.",
    ],
    notes: "Form from the Nov 10-11, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "33across",
    name: "33Across",
    category: "marketing",
    blurb: "Advertising company. The opt-out form takes your email address.",
    optOutUrl: "https://www.33across.com/opt-out",
    homeUrl: "https://www.33across.com/",
    steps: [
      `Open the 33Across opt-out page in your browser. ${BLOCKED_OPEN}`,
      "Enter your email address and submit.",
      "Click the verify link in their email. The Privacy bot got a deletion notice after that.",
    ],
    difficulty: "easy",
    verification: "blocked",
    notes: "Form from the Nov 10-11, 2026 reply. It showed a Cloudflare check to our automated visit on Nov 13.",
  }),
  card({
    id: "youmail",
    name: "YouMail",
    category: "marketing",
    blurb: "Call-blocking and voicemail company. Its request form is only for California residents.",
    optOutUrl: "https://compliance.youmail.com/submit-request",
    homeUrl: "https://www.youmail.com/",
    steps: [
      "Use this form only if you live in California. It is a California privacy-law (CCPA) form.",
      "If you live in California, ask them to delete your information.",
      "If you live elsewhere, skip this card or send a letter instead.",
    ],
    residentsOnly: "California residents only",
    letterRecommended: true,
    notes: "Form from the Nov 10-11, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "data-trust",
    name: "Data Trust",
    category: "marketing",
    blurb: "Political and voter-data company. Use its privacy-choices page.",
    optOutUrl: "https://thedatatrust.com/your-privacy-choices/",
    homeUrl: "https://thedatatrust.com/",
    steps: [
      "Open the Data Trust privacy-choices page.",
      "Ask them to delete your information and stop sharing it.",
      "They may turn down people from states without a consumer privacy law. Washington residents were told they may not qualify.",
    ],
    residentsOnly: "May refuse some states",
    notes: "Address from the Nov 6, 2026 reply. The page loaded on Nov 13. The Washington note is from the Privacy bot and was not retested.",
  }),
  card({
    id: "seamless-ai",
    name: "Seamless.AI",
    category: "marketing",
    blurb: "Work-contact database. Use its preferences page.",
    optOutUrl: "https://preferences.seamless.ai/",
    homeUrl: "https://seamless.ai/",
    steps: [
      "Open the Seamless.AI preferences page.",
      "Ask them to remove your contact profile and stop selling it.",
      "Click the confirmation link if they send one.",
    ],
    notes: "Address from the Nov 6, 2026 reply. The https page loaded on Nov 13.",
  }),
  card({
    id: "clearbit-hubspot",
    name: "Clearbit / HubSpot",
    category: "marketing",
    blurb: "Clearbit's work-contact data is now part of HubSpot. Use HubSpot's privacy request center.",
    optOutUrl: "https://preferences.hubspot.com/",
    homeUrl: "https://www.hubspot.com/hubspot-privacy-preferences",
    steps: [
      "Open HubSpot's privacy request center.",
      "Ask them to delete your information, including any Clearbit data.",
      "HubSpot's [privacy preferences page](https://www.hubspot.com/hubspot-privacy-preferences) explains the same choices.",
      "Click the confirmation link if they send one.",
    ],
    notes: "Both addresses from the Nov 6, 2026 reply. Both loaded on Nov 13.",
  }),
  card({
    id: "eab",
    name: "EAB",
    category: "marketing",
    blurb: "Education-data company. It wants this verification form filled before it acts.",
    optOutUrl:
      "https://privacyportal.onetrust.com/webform/2d4f8bee-b269-434d-a07f-3b94c6618cb4/795af979-a3a2-431b-9d7e-b777155c7a18",
    homeUrl: "https://eab.com/",
    steps: [
      "Open the EAB verification form.",
      "Fill it in and ask them to delete your information.",
      "Click the confirmation link if they send one.",
    ],
    notes: "Form from EAB's Nov 12, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "liveramp",
    name: "LiveRamp",
    category: "marketing",
    blurb: "Data-matching company used by many advertisers. Use its privacy-choices page.",
    optOutUrl: "https://liveramp.com/privacy/my-privacy-choices/",
    homeUrl: "https://liveramp.com/",
    steps: [
      "Open the LiveRamp privacy-choices page.",
      "Choose the request to opt out and delete your information.",
      "Submit it with an email you can open and click the confirmation link if they send one.",
    ],
    notes: "Named by Blueprint Audiences on Nov 12, 2026 as a partner. The page loaded on Nov 13.",
  }),
  card({
    id: "throtle",
    name: "Throtle",
    category: "marketing",
    blurb: "Data-matching company. Uses an online request form.",
    optOutUrl:
      "https://privacyportal.privacypillar.com/dsar/form?formid=33f8dff1-312d-4c66-b12b-64b16b7d47d9&orgid=04a4ea97-ff37-4031-9719-c1963511d70f&propid=72c016a3-81ac-4b8e-b078-2e70940b18f",
    steps: [
      "Open the Throtle request form.",
      "Ask them to delete your information and opt you out of its sale.",
      "Click the confirmation link if they send one.",
    ],
    notes: "Named by Blueprint Audiences on Nov 12, 2026 as a partner. The form loaded on Nov 13.",
  }),
  card({
    id: "broadridge-advisortarget",
    name: "Broadridge / AdvisorTarget",
    category: "marketing",
    blurb: "Optional. Financial-marketing data. Use it if you work in finance or get investment marketing.",
    optOutUrl: "https://app.smartsheet.com/b/form/48a44f05a4644a1f824601e77ad1719d",
    steps: [
      "Open the Broadridge / AdvisorTarget request form.",
      "Ask them to delete your information.",
      "Save the confirmation.",
    ],
    notes: "Form from the Nov 10-11, 2026 reply. The page loaded on Nov 13.",
  }),
  card({
    id: "arounddeal",
    name: "AroundDeal",
    category: "marketing",
    blurb: "Work-contact database. It only acts if you give the exact profile link.",
    optOutUrl: "https://www.arounddeal.com/remove-profile",
    homeUrl: "https://www.arounddeal.com/",
    steps: [
      "AroundDeal only removes a profile when you give the exact AroundDeal or LinkedIn profile link.",
      "If you have a work profile there, open the remove-profile page and paste that link.",
      "If you do not, skip this card.",
    ],
    notes: "Profile-link rule from AroundDeal's Nov 12, 2026 reply. The remove-profile page loaded on Nov 13.",
  }),
  card({
    id: "iss-stoxx",
    name: "ISS STOXX",
    category: "marketing",
    blurb: "Financial-data company. It only offers forms for California and Colorado residents.",
    optOutUrl: "https://www.issgovernance.com/privacy-legal/ccpa/",
    homeUrl: "https://www.issgovernance.com/",
    steps: [
      `Use this only if you live in California or Colorado. ${BLOCKED_OPEN}`,
      "Pick the form for your state and ask them to delete your information.",
      "If you live elsewhere, skip this card.",
    ],
    residentsOnly: "California and Colorado residents only",
    verification: "blocked",
    notes: "Address from ISS STOXX's Nov 12, 2026 reply. It redirected to iss-stoxx.com and showed a firewall page to our automated visit on Nov 13.",
  }),
];
