import { Link } from "react-router-dom";
import type { Broker } from "../../shared/brokers";
import { OptOutButton } from "./OptOutButton";
import { StepList } from "./StepList";

export function BrokerTask({ broker }: { broker: Broker }) {
  return (
    <article className="card" id={broker.id}>
      <header className="card-head">
        <h2>{broker.name}</h2>
        {broker.verification === "failed" ? <span className="flag">Link not verified</span> : null}
      </header>
      <p>{broker.blurb}</p>
      <div className="row">
        <OptOutButton broker={broker} />
        <Link className="button button-quiet" to={`/privacy-tool#${broker.id}`}>
          Track this on the Privacy Tool
        </Link>
      </div>
      <StepList steps={broker.steps} />
    </article>
  );
}
