# Privacy Defender

A free website that helps you remove yourself from people-search sites and cut down spam calls and junk mail.

You work through the Privacy Tool. You can write a removal letter with an AI helper, or copy a plain template if the helper is off. Your name and progress stay in your browser. This project does not store them in a database.

This is not legal advice, and it is not affiliated with any site in the list.

## What you need

- [Node.js](https://nodejs.org/) 20 or newer
- A free [Cloudflare](https://dash.cloudflare.com/) account, when you are ready to put the site online
- A [Groq](https://console.groq.com/) API key, if you want the AI letters. The template letters work without one.

## Run it on your computer

```bash
npm install
npm test
npm run build
```

Copy the example env file and turn on a sample letter writer so you can try the page without a Groq key:

```bash
cp .env.example .dev.vars
```

In `.dev.vars`, set `MOCK_GROQ=true` for a local preview. Set it back to `false` before you deploy.

Then start the site:

```bash
npx wrangler dev
```

Open the address Wrangler prints (usually `http://127.0.0.1:8787`).

`npm run build` makes the pages. `npx wrangler dev` serves those pages and the `/api/letter` route.

## Put it on Cloudflare

Do this yourself when you want the public site. Nothing in this repo deploys it for you.

1. Log in to Cloudflare. Either:

```bash
npx wrangler login
```

or set an API token in the `CLOUDFLARE_API_TOKEN` environment variable. The token needs permission to edit Workers and Workers KV.

2. Create the small counter that enforces 10 AI letters per visitor per day:

```bash
npx wrangler kv namespace create AI_USAGE
```

Copy the id it prints into `wrangler.jsonc`, replacing `00000000000000000000000000000000`.

3. Save your Groq key as a secret. This command does not put the key in the repo:

```bash
printf %s "$GROQ_API_KEY" | npx wrangler secret put GROQ_API_KEY
```

4. Build and deploy:

```bash
npm run build
npx wrangler deploy
```

The Worker name is `privacy-defender`. Preview URLs are turned off in `wrangler.jsonc`.

## Secrets and bindings

| Name | Kind | Required | What it is |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Secret | Yes, for AI letters | Your Groq key. Set with `wrangler secret put`. |
| `GROQ_MODEL` | Variable | No | Defaults to `openai/gpt-oss-120b`. |
| `AI_DAILY_LIMIT_PER_VISITOR` | Variable | No | Defaults to `10`. |
| `MOCK_GROQ` | Variable | No | Keep `false` on Cloudflare. `true` skips Groq and returns a sample letter. |
| `AI_USAGE` | KV namespace | Yes | Stores a hashed visitor id, the UTC date, and a count. |

The letter template still works if the key or the counter is missing. The AI button will show an error and fill in the template.

## How the daily limit works

Cloudflare's built-in Rate Limiting binding can only count a 10-second or 60-second window, and the count is separate in each data center. That cannot mean "10 letters today," so this app does not use it.

It uses Workers KV, which is included on the free Workers plan (100,000 reads and 1,000 writes per day). Each successful AI letter does one read and one write. The key is a SHA-256 hash of a random HttpOnly cookie (`ooh_vid`). If the browser does not send that cookie, the hash is of the visitor's IP address instead. The value is just a number for that UTC date. Names, letters, and emails are not stored there.

KV is not a perfect lock. Two requests at the same moment can both slip through, so someone might get one extra letter. That is acceptable for this cap. Counts reset at midnight UTC because the date is part of the key. Old keys expire after two days.

## Links we could not verify

Checked on October 19, 2026. These rows are marked **Link not verified** in the app:

- **Radaris.** `radaris.com` shows a court-order notice. The old privacy form is not there.
- **PeekYou.** The old opt-out address shows a "domain update" page, not a form.
- **Nuwber.** Their privacy policy names `https://nuwber.com/removal/link`, but the domain name did not resolve.
- **ClustrMaps.** `clustrmaps.com` pointed at `127.0.0.1` and would not connect. The usual opt-out path is still listed.
- **PublicDataUSA.** `publicdatausa.com` did not resolve.
- **ZabaSearch.** The FAQ describes an opt-out form and says the site is powered by Intelius. A separate form address could not be opened (the site returned the same block page for every path).

Some other sites answered our checker with "forbidden" even for a normal browser-style request. Those links are the companies' published opt-out addresses, but you should open each one yourself. They include Whitepages, BeenVerified, PeopleFinders, TruePeopleSearch, FastPeopleSearch, MyLife, Veripages, SearchPeopleFree, PeopleSearchNow, FastBackgroundCheck, NeighborWho (the BeenVerified opt-out), Advanced Background Checks, FamilyTreeNow, CyberBackgroundChecks, and TransUnion's consumer privacy page. The FCC complaint site and OptOutPrescreen also blocked the checker. Their addresses are the official ones.

Checked again on October 22, 2026:

- **CoreLogic** is now Cotality. The card opens `https://www.cotality.com/legal/privacy-policy`. The old `corelogic.com` privacy-center address returned 404. Email privacy@cotality.com is in the steps.
- **PeopleConnect.** One opt-out at `https://suppression.peopleconnect.us/optout` covers Intelius, TruthFinder, Instant Checkmate, US Search, and Addresses.com. That page loaded.
- **Pages that loaded:** USA People Search, InfoTracer, Acxiom, Equifax marketing, LexisNexis (it redirects to the consumer opt-out), Data Axle, Epsilon, Experian marketing, Deep Sync, Google Results about you, and the extra verified opt-out pages added from the site list (Pipl, People Data Labs, SearchBug, Porch Group Media, L2, Sync.me, SpyDialer, PrivateReports, PeopleSearcher, WeInform, TruthRecord, Realeflow, AmeriList, Versium, AtData, StatSocial, Valassis / RRD, Apollo.io, UpLead, PropertyReach, and the court-record network). Search buttons are only on sites where a search page loaded. UFind.name and PrivateNumberChecker blocked the checker, so those cards have no Search button. SearchBug's people search is `https://www.searchbug.com/peoplefinder/`. That page does not fill in a name from the link.

Spam calls, junk mail, carrier tools, and phone settings are filters inside the Privacy Tool. The old `/spam` and `/resources` addresses open that filter. There is no separate tab for them.

## Project layout

- `shared/brokers.ts` — the list of sites. Edit this file to add one. When a step names a form or page, write it as `[opt-out form](https://example.com/optout)` so the Privacy Tool shows a link.
- `src/` — the React pages.
- `worker/index.ts` — the `/api/letter` route.
- `public/` — the icon and security headers.

## Privacy in one paragraph

The Privacy Tool lives in `localStorage`. The only server call with your details is the AI letter button, and that call exists only to ask Groq for the letter text. The server stores a hashed count for the 10-letter daily limit and does not log the letter. There are no ads and no third-party trackers. The site sets one necessary cookie for that count.
