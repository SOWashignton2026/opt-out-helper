import { Link } from "react-router-dom";
import type { Broker } from "../../shared/brokers";

function optOutLabel(broker: Broker): string {
  if (broker.category === "spam" || broker.category === "identity") return "Open official page";
  if (/opt-?out|do-not-sell|removal|suppress|privacy-request|privacy-choices|privacy-rights|optout/i.test(broker.optOutUrl)) {
    return "Open opt-out form";
  }
  try {
    const path = new URL(broker.optOutUrl).pathname;
    if (path === "/" || path === "") return "Open their site";
  } catch {
    return "Open opt-out form";
  }
  if (broker.letterRecommended) return "Open privacy page";
  return "Open opt-out form";
}

export function OptOutButton({ broker }: { broker: Broker }) {
  if (broker.optOutUrl.startsWith("/")) {
    return (
      <Link className="button button-primary" to={broker.optOutUrl}>
        Open the letter page
      </Link>
    );
  }
  return (
    <a className="button button-primary" href={broker.optOutUrl} target="_blank" rel="noopener noreferrer">
      {optOutLabel(broker)}
    </a>
  );
}
