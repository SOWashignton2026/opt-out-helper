/**
 * What's New. Add each update as a new entry at the TOP of this list.
 * date is YYYY-MM-DD (Pacific). Keep bullets short and plain.
 */
export type Update = {
  date: string;
  title: string;
  items: string[];
};

export const UPDATES: Update[] = [
  {
    date: "2026-11-13",
    title: "Fixed opt-out steps and added new sites",
    items: [
      "Fixed SearchUSAPeople: it has no form of its own, so the button now opens InfoTracer's opt-out, which its removal page points to.",
      "Anchor Computer now opens its working privacy request form instead of a privacy policy.",
      "SpyDialer now opens its actual opt-out form. The confirmation link expires in 24 hours.",
      "Experian marketing now uses Experian's Privacy Rights Portal and warns about the identity quiz. CoreLogic / Cotality now uses its online privacy portal.",
      "Apollo.io has a new link and a clearer note that it needs a work email and is built for California and EU law.",
      "Digital Segment now leads with email or phone, since its web form did not work for us.",
      "Added warnings: EproDirect, Snov.io, and YouMail forms are for California residents only. Ekata may ask for a Mastercard card number. Do not enter one.",
      "Added 22 new sites, including Claritas, PeopleWhiz, LiveRamp, National Public Data, YouMail, CallApp, Adstra, and EAB.",
      "Updated Deep Sync, SearchBug, LexisNexis, Lookify, Cadent, WelcomeHomeowner, Google Results about you, MugshotLook, CheckSecrets, and PrivateRecords.net steps and links.",
      "Added safety tips: skip forms for states you do not live in, never pay or give card digits, click confirmation emails quickly, and you never have to upload an ID.",
      "Added this What's New page and an anonymous visit counter. It stores one number. Nothing about you is saved.",
    ],
  },
];

export function formatUpdateDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
