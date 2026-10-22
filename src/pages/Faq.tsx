import { PRIVACY_LAWS, PRIVACY_LAWS_CHECKED } from "../../shared/privacy-laws";
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
          phone books. Data brokers collect those records and sell or show a profile of you. You
          usually did not sign up.
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
          <li>Start with Spokeo, BeenVerified, Whitepages, and the PeopleConnect sites. They show up most often.</li>
          <li>After a site says you are removed, mark it Removed so you can see it in your progress.</li>
        </ul>
      </section>

      <section>
        <h2>Why do some sites refuse to remove me?</h2>
        <p>
          Some people-search sites only honor a removal when you live in a state with a consumer
          privacy law. FastPeopleSearch, TruePeopleSearch, PeopleFinders, and USPhoneBook are part
          of one network that works this way. FastBackgroundCheck, Advanced Background Checks, and
          SmartBackgroundChecks are marked the same way on their cards. If you live in another
          state, such as Washington, they may refuse you.
        </p>
        <p>
          They decide by the state you enter, the address on your listing, and sometimes the IP
          address of the connection you are using. Do not claim to live in another state.
        </p>
        <p>
          This site only names a state privacy law when it is on the list checked {PRIVACY_LAWS_CHECKED}.
          Those states are {PRIVACY_LAWS.map((law) => lawStateName(law.state)).join(", ")}. The laws
          on that list are:
        </p>
        <ul>
          {PRIVACY_LAWS.map((law) => (
            <li key={law.state}>
              {lawStateName(law.state)}: {law.name}
            </li>
          ))}
        </ul>
        <p>If a site refuses you:</p>
        <ul>
          <li>Try that site’s general opt-out form anyway.</li>
          <li>Use Google Results about you. It is under Search Engines in the Privacy Tool.</li>
          <li>Send a letter when the card offers Write a letter.</li>
          <li>Check the site again later. Forms and rules change.</li>
        </ul>
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
