import type { Broker } from "../../shared/brokers";

export function OptOutButton({ broker }: { broker: Broker }) {
  const label = broker.category === "spam" ? "Open official page" : "Open opt-out form";
  return (
    <a className="button button-primary" href={broker.optOutUrl} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
