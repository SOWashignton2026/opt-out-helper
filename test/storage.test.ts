import { describe, expect, it } from "vitest";
import { readSavedData, writeSavedData } from "../src/lib/storage";
import { emptySavedData, LEGACY_STORAGE_KEY, STORAGE_KEY } from "../shared/progress";

function memoryStore() {
  const mem = new Map<string, string>();
  return {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
  };
}

describe("saved profile", () => {
  it("keeps name, city, state, and email for the next visit", () => {
    const store = memoryStore();
    const data = emptySavedData();
    data.profile = {
      ...data.profile,
      firstName: "Ada",
      lastName: "Lovelace",
      city: "Seattle",
      state: "WA",
      email: "ada@example.com",
    };
    writeSavedData(store, data);
    const loaded = readSavedData(store);
    expect(loaded.profile.firstName).toBe("Ada");
    expect(loaded.profile.lastName).toBe("Lovelace");
    expect(loaded.profile.city).toBe("Seattle");
    expect(loaded.profile.state).toBe("WA");
    expect(loaded.profile.email).toBe("ada@example.com");
    expect(store.getItem(STORAGE_KEY)).toContain("Seattle");
  });

  it("reads a profile saved under the previous app name", () => {
    const store = memoryStore();
    store.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: {
          firstName: "Ada",
          lastName: "Lovelace",
          city: "Seattle",
          state: "wa",
          email: "ada@example.com",
          phone: "",
        },
        progress: {},
      }),
    );
    const loaded = readSavedData(store);
    expect(loaded.profile.city).toBe("Seattle");
    expect(loaded.profile.state).toBe("WA");
    expect(store.getItem(STORAGE_KEY)).toContain("Seattle");
  });

  it("drops old reminder timestamps the next time the file is read", () => {
    const store = memoryStore();
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: {
          firstName: "Ada",
          lastName: "Lovelace",
          city: "Seattle",
          state: "WA",
          email: "ada@example.com",
          phone: "2065550100",
        },
        progress: { spokeo: { status: "removed", updatedAt: "2026-01-01T00:00:00.000Z" } },
      }),
    );
    const loaded = readSavedData(store);
    expect(loaded.progress.spokeo).toEqual({ status: "removed" });
    expect(loaded.profile.phone).toBe("2065550100");
    expect(store.getItem(STORAGE_KEY)).not.toContain("updatedAt");
  });
});
