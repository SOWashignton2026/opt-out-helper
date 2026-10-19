import type { Broker } from "../../shared/brokers";

export function OptOutButton({ broker }: { broker: Broker }) {
  const label = broker.category === "people-search" ? "Open opt-out form" : "Open official page";
  return (
    <a className="button button-primary" href={broker.optOutUrl} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
