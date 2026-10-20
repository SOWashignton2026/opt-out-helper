export const RECHECK_DAYS = 90;
export const STORAGE_KEY = "privacy-defender.v1";
export const LEGACY_STORAGE_KEY = "opt-out-helper.v1";

export type Status = "not_started" | "submitted" | "removed" | "not_listed";

export type ItemProgress = {
  status: Status;
  updatedAt: string | null;
};

export type Profile = {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  email: string;
  phone: string;
};

export type SavedData = {
  version: 1;
  profile: Profile;
  progress: Record<string, ItemProgress>;
};

export const EMPTY_PROFILE: Profile = {
  firstName: "",
  lastName: "",
  city: "",
  state: "",
  email: "",
  phone: "",
};

const STATUSES: Status[] = ["not_started", "submitted", "removed", "not_listed"];

export function emptySavedData(): SavedData {
  return { version: 1, profile: { ...EMPTY_PROFILE }, progress: {} };
}

export function needsRecheck(item: ItemProgress | undefined, now = Date.now()): boolean {
  if (!item || item.status === "not_started" || !item.updatedAt) return false;
  const then = Date.parse(item.updatedAt);
  if (Number.isNaN(then)) return false;
  return now - then >= RECHECK_DAYS * 24 * 60 * 60 * 1000;
}

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function parseSavedData(input: unknown): SavedData | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  if (record.version !== 1) return null;
  const profileRaw = record.profile;
  if (!profileRaw || typeof profileRaw !== "object" || Array.isArray(profileRaw)) return null;
  const profileRecord = profileRaw as Record<string, unknown>;
  const profile: Profile = {
    firstName: clip(profileRecord.firstName, 40),
    lastName: clip(profileRecord.lastName, 40),
    city: clip(profileRecord.city, 60),
    state: clip(profileRecord.state, 2).toUpperCase(),
    email: clip(profileRecord.email, 80),
    phone: clip(profileRecord.phone, 20),
  };
  const progress: Record<string, ItemProgress> = {};
  const progressRaw = record.progress;
  if (progressRaw && typeof progressRaw === "object" && !Array.isArray(progressRaw)) {
    for (const [id, value] of Object.entries(progressRaw)) {
      if (!/^[a-z0-9-]{2,40}$/.test(id)) continue;
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const item = value as Record<string, unknown>;
      const status = item.status;
      if (typeof status !== "string" || !STATUSES.includes(status as Status)) continue;
      const updatedAt = typeof item.updatedAt === "string" ? item.updatedAt : null;
      progress[id] = {
        status: status as Status,
        updatedAt: updatedAt && !Number.isNaN(Date.parse(updatedAt)) ? updatedAt : null,
      };
    }
  }
  return { version: 1, profile, progress };
}
