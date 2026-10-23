import type { LetterInput } from "./letter";
import { privacyLawFor } from "./privacy-laws";
import { stateName } from "./states";

function contactLines(input: LetterInput): string[] {
  const lines = [`${input.firstName} ${input.lastName}`, `${input.city}, ${input.state}`];
  if (input.email) lines.push(input.email);
  if (input.phone) lines.push(input.phone);
  return lines;
}

export function buildTemplateLetter(input: LetterInput, brokerName: string, now = new Date()): string {
  const date = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const fullState = stateName(input.state) ?? input.state;
  const who = contactLines(input).join("\n");
  const extra = input.notes ? `\n\nMore detail: ${input.notes}` : "";

  if (input.letterType === "followup") {
    return [
      date,
      "",
      `${brokerName} privacy team,`,
      "",
      `My name is ${input.firstName} ${input.lastName}. I live in ${input.city}, ${fullState}.`,
      "",
      "I already asked you to remove my personal information from your site. I have not received a confirmation that the listing is gone.",
      "",
      "Please delete my listing, including my name and any address, phone number, or email tied to it. Please email me when it is done.",
      "",
      "Thank you.",
      "",
      who,
      extra,
    ]
      .filter((line) => line !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const law = input.letterType === "ccpa" ? privacyLawFor(input.state) : undefined;
  const opening =
    input.letterType === "ccpa"
      ? law
        ? `I am a ${fullState} resident. Under the ${law.name}, I ask you to delete the personal information you keep about me and to stop selling or sharing it.`
        : `I live in ${fullState}. Please delete the personal information you keep about me and stop selling or sharing it.`
      : `Please remove my personal information from ${brokerName}. Take down the public listing for my name, and delete the address, phone number, and email associated with it from the products you control.`;

  const second =
    input.letterType === "ccpa"
      ? `Please remove the public listing for ${input.firstName} ${input.lastName} and delete the address, phone number, and email associated with it.`
      : "Please send me a short confirmation when the removal is finished. I should not have to pay or create an account for this.";

  return [date, "", `${brokerName} privacy team,`, "", `My name is ${input.firstName} ${input.lastName}. I live in ${input.city}, ${fullState}.`, "", opening, "", second, "", "Thank you.", "", who, extra]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
