import { PRIVACY_LAWS } from "../../shared/privacy-laws";
import { US_STATES } from "../../shared/states";

function lawStateName(code: string): string {
  return US_STATES.find((state) => state.code === code)?.name ?? code;
}

export function FaqPage() {
  return (
    <div className="stack prose">
      <h1>Questions people ask</h1>

      <section>
        <h2>Why is my name on these sites?</h2>
        <p>
          A lot of it comes from public records: property rolls, voter files, court records, and old
          phone books. Data brokers collect those records and sell or show a profile of you.
        </p>
      </section>

      <section>
        <h2>How long does removal take?</h2>
        <p>
          Some sites update in a day or two. Others take a few weeks. A month is a fair time to wait
          before you send a follow-up letter. Search engines can keep an old link even after the
          page is gone.
        </p>
      </section>

      <section>
        <h2>Why does a listing come back?</h2>
        <p>
          Brokers buy fresh copies of the same public records. A removal is often a flag on their
          copy, not a change to the courthouse or county file. Check the site again later. This
          site does not email you a reminder.
        </p>
      </section>

      <section>
        <h2>Tips that save time</h2>
        <ul>
          <li>Use a separate email just for opt-outs, so the confirmation links stay in one inbox.</li>
          <li>Do not pay the people-search site to “remove” you. The removal form is free.</li>
          <li>Save the confirmation email or a screenshot, then mark the row Submitted.</li>
          <li>Start with FreePeopleDirectory, PrivateEye, Spokeo, BeenVerified, Whitepages, and the PeopleConnect sites.</li>
          <li>After a site says you are removed, mark it Removed so you can see it in your progress.</li>
        </ul>
      </section>

      <section>
        <h2>Why do some sites refuse to remove me?</h2>
        <p>
          They decide by the state you enter, the address on your listing, and sometimes the IP
          address of the connection you are using. Do not claim to live in another state.
        </p>
        <p>
          The list of states with privacy laws was last checked on 10-22-2026. Those states are
          California, Colorado, Connecticut, Delaware, Iowa, Indiana, Kentucky, Maryland, Minnesota,
          Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah,
          Virginia. The laws on that list are:
        </p>
        <ul>
          {PRIVACY_LAWS.map((law) => (
            <li key={law.state}>
              {lawStateName(law.state)}: {law.name}
            </li>
          ))}
        </ul>
        <p>If a site refuses to remove your information:</p>
        <ul>
          <li>Try that site’s general opt-out form again.</li>
          <li>
            Use Google Results about you to find and remove your information. It is under Search
            Engines in the Privacy Tool.
          </li>
          <li>Send a letter requesting removal of your information</li>
          <li>Check the site later. Forms and rules change periodically.</li>
        </ul>
      </section>

      <section>
        <h2>Why are arrest sites and “people records” sites missing?</h2>
        <p>
          State arrest and warrant sites are not on this list. They do not offer an opt-out, and
          they only matter if an arrest record already exists. The old People Records .org sites
          were offline when this list was checked in October 2026, so there is nothing to remove
          there either.
        </p>
      </section>

      <section>
        <h2>What if a broker has no form and no email?</h2>
        <p>
          Some data brokers do not publish an opt-out form or a privacy email, making it very hard
          for you to remove your information.
        </p>
        <p>A paid removal service can keep sending requests for you.</p>
      </section>

      <section>
        <h2>Is this legal advice?</h2>
        <p>
          No. The letters are a starting point you can edit. Laws differ by state. If you are dealing
          with stalking, identity theft, or a court order, talk to a lawyer or a local advocacy
          group.
        </p>
      </section>
    </div>
  );
}
