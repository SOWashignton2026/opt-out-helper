import { createContext, useContext, useState, type ReactNode } from "react";
import { BROKERS } from "../../shared/brokers";
import {
  emptySavedData,
  LEGACY_STORAGE_KEY,
  parseSavedData,
  STORAGE_KEY,
  type ItemProgress,
  type Profile,
  type SavedData,
  type Status,
} from "../../shared/progress";

type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function parseStored(raw: string | null): SavedData | null {
  if (!raw) return null;
  try {
    return parseSavedData(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Read the saved profile and progress. Falls back to the previous app name's key. */
export function readSavedData(store: KeyValueStore): SavedData {
  const raw = store.getItem(STORAGE_KEY);
  const current = parseStored(raw);
  if (current) {
    // Drop reminder timestamps saved by an older version of this app.
    if (raw?.includes('"updatedAt"')) writeSavedData(store, current);
    return current;
  }
  const legacy = parseStored(store.getItem(LEGACY_STORAGE_KEY));
  if (legacy) {
    writeSavedData(store, legacy);
    return legacy;
  }
  return emptySavedData();
}

export function writeSavedData(store: KeyValueStore, data: SavedData): void {
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode or a full disk. The form still works for this visit.
  }
}

type SavedApi = {
  data: SavedData;
  updateProfile: (patch: Partial<Profile>) => void;
  setStatus: (id: string, status: Status) => void;
  clearAll: () => void;
  handled: number;
  total: number;
};

const SavedDataContext = createContext<SavedApi | null>(null);

function useSavedDataState(): SavedApi {
  const [data, setData] = useState<SavedData>(() => readSavedData(localStorage));

  function updateProfile(patch: Partial<Profile>) {
    setData((current) => {
      const next = { ...current, profile: { ...current.profile, ...patch } };
      writeSavedData(localStorage, next);
      return next;
    });
  }

  function setStatus(id: string, status: Status) {
    setData((current) => {
      const previous = current.progress[id];
      if (status !== "not_started" && previous?.status === status) return current;
      const nextItem: ItemProgress = { status };
      const next = { ...current, progress: { ...current.progress, [id]: nextItem } };
      writeSavedData(localStorage, next);
      return next;
    });
  }

  function clearAll() {
    const next = emptySavedData();
    writeSavedData(localStorage, next);
    setData(next);
  }

  const handled = BROKERS.filter((broker) => {
    const status = data.progress[broker.id]?.status ?? "not_started";
    return status !== "not_started";
  }).length;

  return { data, updateProfile, setStatus, clearAll, handled, total: BROKERS.length };
}

export function SavedDataProvider({ children }: { children: ReactNode }) {
  const api = useSavedDataState();
  return <SavedDataContext.Provider value={api}>{children}</SavedDataContext.Provider>;
}

export function useSavedData(): SavedApi {
  const api = useContext(SavedDataContext);
  if (!api) throw new Error("Saved data is unavailable.");
  return api;
}
