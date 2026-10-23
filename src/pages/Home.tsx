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
        <h2 id="about-title">About me</h2>
        <p>
          Hello there! I'm S. O. Washington, and I recently dove into the world of app and website
          building. This is one of the first tools I've built, and I wanted to share it with you
          because I'm sure your privacy, and your family's, means as much to you as it does to me.
        </p>
        <p>This tool is free and always will be.</p>
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
