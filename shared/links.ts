import { stateName } from "./states";
import type { Profile } from "./progress";

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
