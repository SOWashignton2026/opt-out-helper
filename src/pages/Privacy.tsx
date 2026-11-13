export function PrivacyPage() {
  return (
    <div className="stack prose">
      <h1>Privacy</h1>
      <p>This site is built so your personal details stay on your device.</p>
      <p>
        This site sets one necessary cookie. It only counts the 10 free letters per day. There is
        no tracking, no ads, and no analytics. Find me data stays in this browser. We count visits
        as one anonymous number; nothing about you is stored.
      </p>

      <section>
        <h2>What stays in your browser</h2>
        <p>
          Your name, city, state, email, phone, and Privacy Tool progress are saved in localStorage
          on this device. We do not have an account system or a database of visitors. Clear all my
          data erases that saved information from this browser.
        </p>
      </section>

      <section>
        <h2>What is sent when you ask for an AI letter</h2>
        <p>
          The letter button sends only the fields needed to write the letter: letter type, which
          site you picked, your name, city, state, and the email, phone, or notes if you filled
          them in. That request goes to our server, which sends it to Groq so the model can write
          the text. We do not write those details into the server logs. The logs record the site
          id, the letter type, and whether the request worked.
        </p>
        <p>
          Groq’s own policy is at{" "}
          <a href="https://groq.com/privacy-policy">groq.com/privacy-policy</a>. If you do not want
          your name sent to Groq, use the template button. The template is built on your device.
        </p>
      </section>

      <section>
        <h2>The daily letter limit</h2>
        <p>
          Each visitor can generate 10 AI letters per day. We set a random id in an HttpOnly cookie
          named <code>ooh_vid</code>. The server hashes that id and stores only the hash, the UTC
          date, and a count in Cloudflare KV. If your browser does not send the cookie, the count
          uses a hash of your IP address instead. The cookie is not your name. Clearing the
          Privacy Tool does not reset the count.
        </p>
      </section>

      <section>
        <h2>The visit counter</h2>
        <p>
          We count visits as one anonymous number; nothing about you is stored. The first page you
          open in a browser session asks our own server to add one to a single total in Cloudflare
          KV. Your browser keeps a plain “counted” mark in sessionStorage, which is erased when you
          close the tab, so the same session is not counted twice.
        </p>
        <p>
          The counter does not set a cookie and does not save your IP address, browser, device,
          location, or which pages you read. It does not use any outside analytics service. The
          total is shown on the What's New page.
        </p>
      </section>

      <section>
        <h2>What we do not do</h2>
        <ul>
          <li>No ads and no third-party analytics.</li>
          <li>No sale of your information. We do not have it on a server to sell.</li>
          <li>We are not affiliated with the sites in the Privacy Tool.</li>
        </ul>
      </section>
    </div>
  );
}
