import { Link } from "react-router-dom";
import { PRIVACY_BOT_TEMPLATE_URL, privacyBotTemplateHref } from "../../shared/links";

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
      <h1 className="sr">Privacy Defender</h1>
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
          These tools are in the Privacy Tool. There is no separate tab. Use the Spam Calls & Junk
          Mail filter to register on the Do Not Call list, report unwanted calls, opt out of junk
          mail, and turn on your phone’s spam settings.
        </p>
        <Link className="text-link" to="/privacy-tool?filter=spam">
          Open Spam Calls & Junk Mail
        </Link>
      </section>

      <PrivacyBot />
    </div>
  );
}

function PrivacyBot() {
  const templateUrl = privacyBotTemplateHref(PRIVACY_BOT_TEMPLATE_URL);
  return (
    <section className="panel" aria-labelledby="bot-title">
      <h2 id="bot-title">Already use Grok Bot?</h2>
      <p>
        A free privacy assistant that finds your personal info on people-search sites and data
        brokers, walks you through removing it site by site, and cuts spam calls. It watches for
        breaches and never submits, sends or changes anything without your yes.
      </p>
      {templateUrl ? (
        <a className="button" href={templateUrl} target="_blank" rel="noopener noreferrer">
          Get the free Privacy Bot template
          <span className="sr"> (opens in a new tab)</span>
        </a>
      ) : (
        <p className="hint">Template link coming soon</p>
      )}
    </section>
  );
}
