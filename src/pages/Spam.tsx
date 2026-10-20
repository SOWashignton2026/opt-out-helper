import { Link } from "react-router-dom";
import { BROKERS, brokersByIds, SPAM_CALL_IDS } from "../../shared/brokers";
import { BrokerTask } from "../components/BrokerTask";

export function SpamPage() {
  const tasks = brokersByIds(SPAM_CALL_IDS);
  const phoneSites = BROKERS.filter((broker) => broker.phoneSearchUrl);

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Spam Calls and Junk Mail</h1>
        <p>
          Register your number and report unwanted calls. Mail opt-outs, carrier tools, and phone
          settings are under Additional Resources. Mark each one on the Privacy Tool.
        </p>
      </header>
      {tasks.map((broker) => (
        <BrokerTask key={broker.id} broker={broker} />
      ))}

      <section className="panel" aria-labelledby="phone-title">
        <h2 id="phone-title">Look up your phone number</h2>
        <p>
          Some people-search sites list you by phone number even when a name search misses. Save
          your number on the Privacy Tool, then open these lookups and remove the listing if it is
          yours.
        </p>
        <ul className="link-list">
          {phoneSites.map((broker) => (
            <li key={broker.id}>
              <Link to={`/privacy-tool#${broker.id}`}>{broker.name}</Link>
              <span> — track the removal with the rest of the Privacy Tool.</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
