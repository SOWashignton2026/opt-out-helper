import { brokersByIds, RESOURCE_IDS } from "../../shared/brokers";
import { BrokerTask } from "../components/BrokerTask";

export function ResourcesPage() {
  const tasks = brokersByIds(RESOURCE_IDS);

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Additional Resources</h1>
        <p>
          Mail opt-outs, the free spam-call tools from the big phone carriers, and the settings on
          your phone. Mark each one on the Privacy Tool.
        </p>
      </header>
      {tasks.map((broker) => (
        <BrokerTask key={broker.id} broker={broker} />
      ))}
    </div>
  );
}
