import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Add your name",
    text: "Type your name, city, and state once. It stays on this phone or computer. We do not make an account.",
  },
  {
    title: "Work the checklist",
    text: "Open each site, ask them to remove you, and mark it Submitted, Removed, or Not listed.",
  },
  {
    title: "Send a letter if they ask",
    text: "Some sites want a written request. The letter page can draft one, or you can copy a plain template.",
  },
];

export function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">Free and private</p>
        <h1>Take yourself off people-search sites</h1>
        <p className="lede">
          Opt Out Helper is a checklist for the sites that publish your name, address, and phone
          number. You do the removals yourself. Nothing you type is saved on our server.
        </p>
        <div className="row">
          <Link className="button" to="/checklist">
            Open the checklist
          </Link>
          <Link className="button button-quiet" to="/letters">
            Write a removal letter
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="step-num">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel" aria-labelledby="also-title">
        <h2 id="also-title">Calls and junk mail too</h2>
        <p>
          The same checklist includes the National Do Not Call Registry, credit-offer opt-out,
          junk-mail opt-out, and the free spam-call tools from the big phone carriers.
        </p>
        <Link className="text-link" to="/spam">
          See the calls and junk mail steps
        </Link>
      </section>
    </div>
  );
}
