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

function XIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 1 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-4.8ZM9.8 15.5v-7l6.3 3.5-6.3 3.5Z"
      />
    </svg>
  );
}

export function HomePage() {
  return (
    <div className="stack">
      <section className="about" aria-labelledby="about-title">
        <h2 id="about-title">About me</h2>
        <p>
          Hello there! I'm S. O. Washington, and I recently dove into the world of app and website
          building. This is one of the first tools I've built, and I wanted to share it with you
          because I'm sure your privacy, and your family's, means as much to you as it does to me.
        </p>
        <p>
          This tool is free and always will be. If you want to learn more about what I'm working
          on, feel free to check out my X account or YouTube channel.
        </p>
        <div className="row">
          <a
            className="button button-quiet social"
            href="https://x.com/sowashington26"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XIcon />
            X @SOwashington26
            <span className="sr"> (opens in a new tab)</span>
          </a>
          <a
            className="button button-quiet social"
            href="https://youtube.com/@TheRealPreviewsAndReviews"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YouTubeIcon />
            YouTube
            <span className="sr"> (opens in a new tab)</span>
          </a>
        </div>
      </section>

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
