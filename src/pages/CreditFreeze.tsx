import { Link } from "react-router-dom";
import {
  ANNUAL_CREDIT_REPORT_URL,
  CHEX_MAIL,
  CHEX_PHONE,
  CHEX_URL,
  EQUIFAX_FREEZE_URL,
  EQUIFAX_MAIL,
  EQUIFAX_MINOR_FORM,
  EQUIFAX_PHONE,
  EXPERIAN_FREEZE_URL,
  EXPERIAN_MAIL,
  EXPERIAN_PHONE,
  INNOVIS_PHONE,
  INNOVIS_URL,
  IRS_IP_PIN_URL,
  NCTUE_MAIL,
  NCTUE_PHONE,
  NCTUE_PORTAL,
  NCTUE_URL,
  OPT_OUT_PRESCREEN_URL,
  TRANSUNION_FREEZE_URL,
  TRANSUNION_MAIL,
  TRANSUNION_PHONE,
  USA_GOV_FREEZE_URL,
} from "../../shared/credit-freeze";

export function CreditFreezePage() {
  return (
    <div className="stack prose">
      <header className="page-intro">
        <h1>Freeze your credit</h1>
        <p className="lede">
          A credit freeze stops lenders from pulling your credit report. A thief then has a much
          harder time opening a new card or loan in your name. It is free by federal law to place,
          lift, and remove. It does not hurt your credit score. It lasts until you lift it. Your
          current cards and loans keep working.
        </p>
        <p>
          You have to freeze each of the three bureaus yourself. One does not tell the others. Plan
          on 20 to 30 minutes for all three online. Nothing you read here is sent to a server. The
          links below go to the bureaus' own pages.
        </p>
        <p className="hint">
          Links and phone numbers were checked on official pages on October 28, 2026. Timing rules
          are from{" "}
          <a href={USA_GOV_FREEZE_URL}>USA.gov</a>.
        </p>
      </header>

      <section className="panel" aria-labelledby="ready-title">
        <h2 id="ready-title">What to have ready</h2>
        <ul>
          <li>Your full legal name, date of birth, and Social Security number</li>
          <li>Your current address, plus any address from the last 2 years</li>
          <li>An email address, and a phone that can receive text codes</li>
          <li>A password manager, or another safe place for each bureau's login</li>
          <li>
            If you use mail: a copy of a photo ID and a copy of a utility bill or bank statement.
            Send copies, never the originals.
          </li>
        </ul>
        <p>
          When you are done, mark the bureaus under{" "}
          <Link to="/privacy-tool?filter=identity">Identity</Link> in the Privacy Tool. That
          checklist stays in this browser.
        </p>
      </section>

      <section className="panel" aria-labelledby="equifax-title">
        <h2 id="equifax-title">1. Equifax</h2>
        <ul className="link-list">
          <li>
            Online: <a href={EQUIFAX_FREEZE_URL}>Equifax security freeze</a>
          </li>
          <li>Phone: {EQUIFAX_PHONE}</li>
          <li>Mail: {EQUIFAX_MAIL}</li>
        </ul>
        <ol className="plain-steps">
          <li>Open the link, choose to place a freeze, and create a free myEquifax account.</li>
          <li>Verify your identity. Equifax can use a one-time text code or questions about your credit.</li>
          <li>Choose place a freeze. Save the confirmation.</li>
        </ol>
        <p>Skip any offer for paid Equifax Complete, a credit lock, or a monitoring plan. You do not need those to freeze.</p>
        <p className="hint">
          The mailing address is the one printed on Equifax's own minor-freeze form. The same box
          is listed on Experian's guide to freezing all three bureaus.
        </p>
      </section>

      <section className="panel" aria-labelledby="experian-title">
        <h2 id="experian-title">2. Experian</h2>
        <ul className="link-list">
          <li>
            Online: <a href={EXPERIAN_FREEZE_URL}>Experian security freeze</a>
          </li>
          <li>Phone: {EXPERIAN_PHONE} (1-888-EXPERIAN)</li>
          <li>Mail: {EXPERIAN_MAIL}</li>
        </ul>
        <ol className="plain-steps">
          <li>Open the link and sign up for a free Experian account.</li>
          <li>Verify your identity.</li>
          <li>Go to the freeze center and turn the freeze on. It is meant to happen right away.</li>
        </ol>
        <p>
          Experian no longer uses a freeze PIN. Your account login is the key. Experian will push
          CreditLock. That is a paid membership. The free freeze does the same job.
        </p>
        <p className="hint">
          A mailed request should include your name, Social Security number, addresses for the past
          2 years, date of birth, a copy of your ID, and a copy of a utility bill or bank statement.
        </p>
      </section>

      <section className="panel" aria-labelledby="transunion-title">
        <h2 id="transunion-title">3. TransUnion</h2>
        <ul className="link-list">
          <li>
            Online: <a href={TRANSUNION_FREEZE_URL}>TransUnion credit freeze</a>
          </li>
          <li>Phone: {TRANSUNION_PHONE}</li>
          <li>Mail: {TRANSUNION_MAIL}</li>
        </ul>
        <ol className="plain-steps">
          <li>Open the link, create a free TransUnion account, and verify your identity.</li>
          <li>Turn the freeze on. Save the confirmation.</li>
        </ol>
        <p>Skip TransUnion credit monitoring and paid lock offers.</p>
        <p className="hint">
          TransUnion's own page blocked an automated check on October 28, 2026. The link, phone,
          and mailing address above are the ones Experian's official three-bureau guide lists.
          Open the page in your browser and follow what you see there if it differs.
        </p>
      </section>

      <section aria-labelledby="speed-title">
        <h2 id="speed-title">How fast it happens</h2>
        <p>
          <a href={USA_GOV_FREEZE_URL}>USA.gov</a> says an online or phone freeze must be in place
          within 1 business day. It is often instant. A freeze by mail must be in place within 3
          business days.
        </p>
      </section>

      <section aria-labelledby="lift-title">
        <h2 id="lift-title">Lift a freeze when you need credit</h2>
        <p>
          When you apply for a loan, a card, an apartment, or some jobs, log in and lift the freeze.
          USA.gov says an online or phone lift must happen within 1 hour. A lift by mail must happen
          within 3 business days.
        </p>
        <ul>
          <li>
            Choose a temporary lift with an end date so the freeze comes back on its own. Experian
            calls this "schedule a thaw." You can also remove the freeze and remember to put it back.
          </li>
          <li>Ask the lender which bureau they use, and lift only that one.</li>
          <li>
            While you are frozen, you can still see your file. So can your current lenders, debt
            collectors, some government agencies, and the companies that send pre-screened credit
            offers. Stop those offers at{" "}
            <a href={OPT_OUT_PRESCREEN_URL}>OptOutPrescreen</a>.
          </li>
        </ul>
      </section>

      <section aria-labelledby="login-title">
        <h2 id="login-title">Save the logins</h2>
        <ul>
          <li>Use a unique, strong password for each bureau and save it in a password manager.</li>
          <li>Turn on 2-step codes if the bureau offers them.</li>
          <li>Write down which email you used for each bureau.</li>
          <li>Innovis still mails a 10-digit freeze PIN. Keep that letter.</li>
          <li>
            Use only the official links on this page. Do not give your Social Security number to
            someone who calls you and claims to be a bureau.
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="upsell-title">
        <h2 id="upsell-title">Skip the paid upsells</h2>
        <p className="notice">
          You never have to buy anything to freeze, lift, or remove a freeze.
        </p>
        <ul>
          <li>
            A "credit lock" (Experian CreditLock, and the lock products from Equifax and TransUnion)
            is paid or bundled with a paid plan. The free freeze is the protection backed by federal
            law.
          </li>
          <li>
            Paid credit monitoring and identity-theft subscriptions are optional. For a free look at
            your reports, use <a href={ANNUAL_CREDIT_REPORT_URL}>AnnualCreditReport.com</a>, the
            official free-report site.
          </li>
        </ul>
      </section>

      <section aria-labelledby="extras-title">
        <h2 id="extras-title">Optional free extras</h2>

        <h3>Innovis</h3>
        <p>
          Innovis is sometimes called the fourth credit bureau. Place a free freeze at{" "}
          <a href={INNOVIS_URL}>Innovis</a> or call {INNOVIS_PHONE}. They mail a 10-digit PIN in the
          confirmation letter. Keep it.
        </p>

        <h3>ChexSystems</h3>
        <p>
          This file is what many banks check before opening a checking account. Freeze it at{" "}
          <a href={CHEX_URL}>ChexSystems</a> or call {CHEX_PHONE}. Mail: {CHEX_MAIL}.
        </p>

        <h3>NCTUE</h3>
        <p>
          Phone, cable, and utility companies use this file. Start at{" "}
          <a href={NCTUE_URL}>NCTUE</a> or the <a href={NCTUE_PORTAL}>consumer portal</a>. Phone:{" "}
          {NCTUE_PHONE}. Mail: {NCTUE_MAIL}.
        </p>

        <h3>IRS Identity Protection PIN</h3>
        <p>
          An IP PIN is a 6-digit number that stops someone else from filing a tax return with your
          Social Security number. It is free for anyone with a Social Security number or ITIN who
          can verify their identity. The fastest way is your IRS online account, from the{" "}
          <a href={IRS_IP_PIN_URL}>IRS IP PIN page</a>.
        </p>
        <ul>
          <li>A new PIN is issued every year. It is valid for that calendar year.</li>
          <li>
            The IRS says the online tool generally shows your current PIN from mid-January through
            mid-November.
          </li>
          <li>
            If you cannot verify online, and the adjusted gross income on your last return is below
            $84,000 (or $168,000 if you are married filing jointly), you can use Form 15227. If you
            do not qualify for that form, make an appointment at a Taxpayer Assistance Center.
          </li>
          <li>
            Anyone under 18 has to use one of those other paths. A parent or guardian can also
            request a PIN for a dependent.
          </li>
          <li>
            The IRS will not call, email, or text you to ask for this PIN. Those messages are scams.
          </li>
        </ul>

        <h3>A child or a spouse</h3>
        <p>
          A spouse or partner has to place their own freezes, with their own accounts. Do it
          together, one person at a time. Each adult verifies their own identity.
        </p>
        <p>
          A parent or guardian can freeze a child's file for free. Equifax does this by mail for a
          child under 16. Use{" "}
          <a href={EQUIFAX_MINOR_FORM}>Equifax's minor freeze form</a> and send the copies the form
          lists: the parent's government ID, Social Security card, and birth certificate, plus the
          child's Social Security card and birth certificate. The form also accepts a court order,
          a power of attorney, or foster-care papers as proof you are the parent. Follow the form
          if it asks for something this summary skips.
        </p>
        <p>
          Experian's freeze page says a parent or guardian can freeze a child's file by mail. Follow
          the instructions on that page. TransUnion's freeze page blocked our check, so open it
          yourself and follow their protected-consumer instructions before you mail anything. Do not
          assume the Equifax document list is what the other two bureaus want.
        </p>
      </section>

      <section aria-labelledby="check-title">
        <h2 id="check-title">Quick checklist</h2>
        <ul>
          <li>Equifax frozen</li>
          <li>Experian frozen</li>
          <li>TransUnion frozen</li>
          <li>Logins saved in a password manager</li>
          <li>Optional: Innovis, ChexSystems, NCTUE, IRS IP PIN</li>
          <li>Kids done by mail, or a partner done with their own accounts</li>
        </ul>
        <p>
          <Link className="button" to="/privacy-tool?filter=identity">
            Track this in the Privacy Tool
          </Link>
        </p>
      </section>
    </div>
  );
}
