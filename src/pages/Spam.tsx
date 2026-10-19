import { Link } from "react-router-dom";
import { BROKERS, type Broker } from "../../shared/brokers";
import { OptOutButton } from "../components/OptOutButton";
import { StepList } from "../components/StepList";

function Task({ broker }: { broker: Broker }) {
  return (
    <article className="card" id={broker.id}>
      <header className="card-head">
        <h2>{broker.name}</h2>
        {broker.verification === "failed" ? <span className="flag">Link not verified</span> : null}
      </header>
      <p>{broker.blurb}</p>
      <div className="row">
        <OptOutButton broker={broker} />
        <Link className="button button-quiet" to={`/checklist#${broker.id}`}>
          Track this on the checklist
        </Link>
      </div>
      <StepList steps={broker.steps} />
    </article>
  );
}

export function SpamPage() {
  const tasks = BROKERS.filter((broker) => broker.category === "calls-and-junk");
  const phoneSites = BROKERS.filter((broker) => broker.phoneSearchUrl);

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Stop spam calls and junk</h1>
        <p>
          These are official registries, complaint forms, and phone settings. They do not replace
          the people-search removals, but they cut a lot of sales calls and mail. Mark each one on
          the same checklist.
        </p>
      </header>
      {tasks.map((broker) => (
        <Task key={broker.id} broker={broker} />
      ))}

      <section className="panel" aria-labelledby="phone-title">
        <h2 id="phone-title">Look up your phone number</h2>
        <p>
          Some people-search sites list you by phone number even when a name search misses. Save
          your number on the checklist, then open these lookups and remove the listing if it is
          yours.
        </p>
        <ul className="link-list">
          {phoneSites.map((broker) => (
            <li key={broker.id}>
              <Link to={`/checklist#${broker.id}`}>{broker.name}</Link>
              <span> — track the removal with the rest of the checklist.</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
