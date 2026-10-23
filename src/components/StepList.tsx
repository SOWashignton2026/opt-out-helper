import { parseStep } from "../../shared/steps";

export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="plain-steps">
      {steps.map((step) => (
        <li key={step}>
          {parseStep(step).map((piece, index) =>
            piece.kind === "text" ? (
              <span key={index}>{piece.text}</span>
            ) : (
              <a key={index} href={piece.href} target="_blank" rel="noopener noreferrer">
                {piece.text}
              </a>
            ),
          )}
        </li>
      ))}
    </ol>
  );
}
