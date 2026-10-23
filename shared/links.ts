import { stateName } from "./states";
import type { Profile } from "./progress";

/**
 * Free Privacy Bot template on Grok. Empty string hides the button and shows
 * "Template link coming soon".
 */
export const PRIVACY_BOT_TEMPLATE_URL = "https://x.ai/bot/m8LgFBTwlCWHQvVMy77z_";

export function privacyBotTemplateHref(url: string = PRIVACY_BOT_TEMPLATE_URL): string | null {
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function titleSlug(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

function lowerSlug(value: string): string {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean).join("-");
}

export function phoneDigits(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

/** Fill a known search-address pattern. Returns null when a required piece is missing. */
export function buildSearchUrl(template: string, profile: Profile): string | null {
  const first = profile.firstName.trim();
  const last = profile.lastName.trim();
  const city = profile.city.trim();
  const state = profile.state.trim().toUpperCase();
  const fullState = state ? stateName(state) : null;
  const phone = phoneDigits(profile.phone);

  if ((template.includes("{first") || template.includes("{last") || template.includes("{nameSlug")) && (!first || !last)) {
    return null;
  }
  if (template.includes("{city") && !city) return null;
  if ((template.includes("{state}") || template.includes("{stateLower}") || template.includes("{stateName}")) && !state) {
    return null;
  }
  if (template.includes("{stateName}") && !fullState) return null;
  if (template.includes("{phone}") && !phone) return null;

  const tokens: Record<string, string> = {
    "{first}": first,
    "{last}": last,
    "{firstSlug}": titleSlug(first),
    "{lastSlug}": titleSlug(last),
    "{firstLower}": lowerSlug(first),
    "{lastLower}": lowerSlug(last),
    "{nameSlug}": titleSlug(`${first} ${last}`),
    "{city}": city,
    "{citySlug}": titleSlug(city),
    "{cityLower}": lowerSlug(city),
    "{state}": state,
    "{stateLower}": state.toLowerCase(),
    "{stateName}": fullState ?? "",
    "{phone}": phone ?? "",
  };

  let url = template;
  for (const [token, value] of Object.entries(tokens)) {
    url = url.split(token).join(encodeURIComponent(value));
  }
  if (url.includes("{")) return null;
  return url;
}

type SearchTarget = {
  optOutUrl: string;
  searchUrlTemplate?: string;
  homeUrl?: string;
};

/** A working lookup link, only when the site publishes a search address. */
export function selfSearchUrl(target: SearchTarget, profile: Profile): string | null {
  if (!target.searchUrlTemplate) return null;
  return buildSearchUrl(target.searchUrlTemplate, profile);
}

export function searchMeHref(target: SearchTarget, profile: Profile): string {
  if (target.searchUrlTemplate) {
    const built = buildSearchUrl(target.searchUrlTemplate, profile);
    if (built) return built;
  }
  if (target.homeUrl) return target.homeUrl;
  try {
    return `${new URL(target.optOutUrl).origin}/`;
  } catch {
    return target.optOutUrl;
  }
}
