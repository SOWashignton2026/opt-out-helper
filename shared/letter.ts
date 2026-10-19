import type { Broker } from "./brokers";
import { isStateCode } from "./states";

export type LetterType = "general" | "ccpa" | "followup";

export type LetterInput = {
  letterType: LetterType;
  brokerId: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  notes: string;
};

export const LETTER_LIMITS = {
  firstName: 40,
  lastName: 40,
  city: 60,
  email: 80,
  phone: 20,
  notes: 400,
  bodyBytes: 8000,
} as const;

const LETTER_TYPES: LetterType[] = ["general", "ccpa", "followup"];

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]{0,39}$/u;
const CITY_PATTERN = /^[\p{L}][\p{L}\s.'-]{0,59}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\-\s]{7,20}$/;

export type LetterValidation =
  | { ok: true; value: LetterInput; broker: Broker }
  | { ok: false; error: string };

function asRecord(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export function validateLetterRequest(
  input: unknown,
  brokers: Broker[],
): LetterValidation {
  const record = asRecord(input);
  if (!record) return { ok: false, error: "Send a JSON object." };

  const letterType = cleanText(record.letterType);
  if (!LETTER_TYPES.includes(letterType as LetterType)) {
    return { ok: false, error: "Pick a letter type." };
  }

  const brokerId = cleanText(record.brokerId);
  const broker = brokers.find((item) => item.id === brokerId);
  if (!broker || broker.category !== "people-search") {
    return { ok: false, error: "Pick a people-search site from the list." };
  }

  const firstName = cleanText(record.firstName);
  const lastName = cleanText(record.lastName);
  const city = cleanText(record.city);
  const state = cleanText(record.state).toUpperCase();
  const email = cleanText(record.email);
  const phone = cleanText(record.phone);
  const notes = cleanText(record.notes);

  if (!NAME_PATTERN.test(firstName) || firstName.length > LETTER_LIMITS.firstName) {
    return { ok: false, error: "Enter a first name using letters, up to 40 characters." };
  }
  if (!NAME_PATTERN.test(lastName) || lastName.length > LETTER_LIMITS.lastName) {
    return { ok: false, error: "Enter a last name using letters, up to 40 characters." };
  }
  if (!CITY_PATTERN.test(city) || city.length > LETTER_LIMITS.city) {
    return { ok: false, error: "Enter a city using letters, up to 60 characters." };
  }
  if (!isStateCode(state)) {
    return { ok: false, error: "Pick a U.S. state." };
  }
  if (email && (email.length > LETTER_LIMITS.email || !EMAIL_PATTERN.test(email))) {
    return { ok: false, error: "That email does not look valid." };
  }
  if (phone && (phone.length > LETTER_LIMITS.phone || !PHONE_PATTERN.test(phone))) {
    return { ok: false, error: "That phone number does not look valid." };
  }
  if (notes.length > LETTER_LIMITS.notes) {
    return { ok: false, error: "Keep the extra notes under 400 characters." };
  }

  return {
    ok: true,
    broker,
    value: {
      letterType: letterType as LetterType,
      brokerId,
      firstName,
      lastName,
      city,
      state,
      email,
      phone,
      notes,
    },
  };
}

export function buildLetterPrompt(input: LetterInput, brokerName: string): string {
  const lines = [
    `Letter type: ${input.letterType}`,
    `Site: ${brokerName}`,
    `Name: ${input.firstName} ${input.lastName}`,
    `City: ${input.city}`,
    `State: ${input.state}`,
  ];
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.phone) lines.push(`Phone: ${input.phone}`);
  if (input.notes) lines.push(`Extra details from the person: ${input.notes}`);
  lines.push(
    "Write the letter they can paste into that site's form or email. Use only the facts above.",
  );
  return lines.join("\n");
}

export const LETTER_SYSTEM_PROMPT = [
  "You write short, polite removal-request letters for a person asking a data broker to take down their listing.",
  "Return plain text only. No markdown, no JSON, and no commentary before or after the letter.",
  "Do not invent addresses, account numbers, dates of birth, or statute names you were not given.",
  "If the letter type is ccpa and the state is CA, you may mention the California Consumer Privacy Act (CCPA/CPRA).",
  "For any other state, ask them to delete the information under that state's consumer privacy rights. Do not name a specific statute.",
  "If the letter type is followup, say they already asked and have not received a confirmation.",
  "Keep the letter under 350 words.",
].join(" ");
