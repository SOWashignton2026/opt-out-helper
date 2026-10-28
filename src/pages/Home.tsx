import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Fill out your information",
    text: "Type your basic information to use copy/paste function during opt-out process. Your information stays on this device and browser, unless you choose to clear your data by utilizing “Clear all my data” button.",
  },
  {
    title: "Go down the list",
    text: "Open each site, search your information, complete form to remove it, and mark it Submitted, Removed, or Not listed for your reference.",
  },
  {
    title: "Send a letter if they ask",
    text: "Some sites want a written request. The letter page can draft one, or you can copy a plain template.",
  },
];

export function HomePage() {
  return (
    <div className="stack">
      <h1 className="sr">Privacy Defender</h1>
      <section className="about" aria-labelledby="about-title">
        <h2 id="about-title">About this tool</h2>
        <p>
          Have you ever gotten a spam call?
          <br />
          Is your mailbox overflowing with nothing but junk mail?
          <br />
          Do you keep getting “You’re pre-approved for…” offers?
          <br />
          Want it to stop?
        </p>
        <p>
          Use this free web app to remove your personal information from hundreds of data brokers
          and protect it from future exposure. Many companies offer the same service—but charge
          hundreds of dollars a year. This tool does the same thing,&nbsp;&nbsp;but it is completely
          free.
        </p>
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

      <div className="row">
        <Link className="button" to="/privacy-tool">
          Open the Privacy Tool
        </Link>
      </div>

      <section className="panel" aria-labelledby="freeze-title">
        <h2 id="freeze-title">Freeze your credit</h2>
        <p>
          A credit freeze is free by law. It stops a thief from opening a new card or loan in your
          name. The <Link to="/credit-freeze">credit freeze guide</Link> walks through Equifax,
          Experian, and TransUnion, plus a few optional free extras. You can check them off under{" "}
          <Link to="/privacy-tool?filter=identity">Identity</Link> in the Privacy Tool.
        </p>
      </section>

      <section className="panel" aria-labelledby="also-title">
        <h2 id="also-title">Spam Calls and Junk Mail</h2>
        <p>
          These tools are in the{" "}
          <Link to="/privacy-tool?filter=spam">Privacy Tool</Link> Tab. Use them to register on the
          Do Not Call list, report unwanted calls, opt out of junk mail, and turn on your phone's
          spam settings.
        </p>
      </section>
    </div>
  );
}
