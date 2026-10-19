import { useEffect, useState } from "react";
import { BROKERS } from "../../shared/brokers";
import {
  emptySavedData,
  parseSavedData,
  STORAGE_KEY,
  type ItemProgress,
  type Profile,
  type SavedData,
  type Status,
} from "../../shared/progress";

function readStorage(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySavedData();
    return parseSavedData(JSON.parse(raw)) ?? emptySavedData();
  } catch {
    return emptySavedData();
  }
}

export function useSavedData() {
  const [data, setData] = useState<SavedData>(readStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function updateProfile(patch: Partial<Profile>) {
    setData((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }

  function setStatus(id: string, status: Status) {
    setData((current) => {
      const previous = current.progress[id];
      const next: ItemProgress = {
        status,
        updatedAt: status === "not_started" ? null : new Date().toISOString(),
      };
      if (status !== "not_started" && previous?.status === status) return current;
      return { ...current, progress: { ...current.progress, [id]: next } };
    });
  }

  function replaceAll(next: SavedData) {
    setData(next);
  }

  function clearAll() {
    setData(emptySavedData());
  }

  const handled = BROKERS.filter((broker) => {
    const status = data.progress[broker.id]?.status ?? "not_started";
    return status !== "not_started";
  }).length;

  return { data, updateProfile, setStatus, replaceAll, clearAll, handled, total: BROKERS.length };
}
