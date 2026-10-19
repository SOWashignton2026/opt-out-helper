export type StepPiece =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string };

const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;

/** Turn `[label](https://...)` markers in a step into text and link pieces. */
export function parseStep(step: string): StepPiece[] {
  const pieces: StepPiece[] = [];
  let last = 0;
  for (const match of step.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) pieces.push({ kind: "text", text: step.slice(last, index) });
    pieces.push({ kind: "link", text: match[1], href: match[2] });
    last = index + match[0].length;
  }
  if (last < step.length) pieces.push({ kind: "text", text: step.slice(last) });
  if (pieces.length === 0) pieces.push({ kind: "text", text: step });
  return pieces;
}

export function stepHrefs(step: string): string[] {
  return parseStep(step).flatMap((piece) => (piece.kind === "link" ? [piece.href] : []));
}
