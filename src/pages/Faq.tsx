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
          copy, not a change to the courthouse or county file. Check again about every 90 days. The
          checklist will remind you inside the app. It will not email you.
        </p>
      </section>

      <section>
        <h2>Tips that save time</h2>
        <ul>
          <li>Use a separate email just for opt-outs, so the confirmation links stay in one inbox.</li>
          <li>Do not pay the people-search site to “remove” you. The removal form is free.</li>
          <li>Save the confirmation email or a screenshot, then mark the row Submitted.</li>
          <li>Start with Spokeo, BeenVerified, Whitepages, and the PeopleConnect sites. They show up most often.</li>
          <li>After a site says you are removed, mark it Removed. The app will flag it again in 90 days.</li>
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
