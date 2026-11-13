import { UPDATES, formatUpdateDate } from "../../shared/whats-new";
import { formatVisits } from "../../shared/visits";
import { useVisitTotal } from "../lib/visits";

export function WhatsNewPage() {
  const visits = useVisitTotal();
  return (
    <div className="stack prose">
      <h1>What's New</h1>
      <p>Updates to the sites, links, and steps in Privacy Defender. Newest first.</p>

      {UPDATES.map((update) => (
        <section key={update.date + update.title} className="panel update" aria-labelledby={`update-${update.date}`}>
          <h2 id={`update-${update.date}`}>
            <time dateTime={update.date}>{formatUpdateDate(update.date)}</time>
            <span className="update-title"> — {update.title}</span>
          </h2>
          <ul>
            {update.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="visits-title">
        <h2 id="visits-title">Visits</h2>
        <p data-testid="visit-count">
          {visits === null
            ? "The visit count is not available right now."
            : `${formatVisits(visits)} counted since November 13, 2026.`}
        </p>
        <p className="hint">
          We count visits as one anonymous number. Each browser session adds one. Nothing about you is
          stored: no cookie, no IP address, and no device details.
        </p>
      </section>
    </div>
  );
}
