import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BROKERS, type Broker, type Category } from "../../shared/brokers";
import { buildSearchUrl } from "../../shared/links";
import { needsRecheck, RECHECK_DAYS, type SavedData, type Status } from "../../shared/progress";
import { US_STATES } from "../../shared/states";
import { OptOutButton } from "../components/OptOutButton";
import { StepList } from "../components/StepList";
import { useSavedData } from "../lib/storage";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "submitted", label: "Submitted" },
  { value: "removed", label: "Removed" },
  { value: "not_listed", label: "Not listed" },
];

type Filter = "all" | Category | "recheck";

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function recheckLabel(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const due = new Date(then + RECHECK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return `Updated ${formatWhen(iso)}. Recheck after ${formatWhen(due)}.`;
}

function joinedName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(" ");
}

function cityAndState(city: string, state: string): string {
  return [city.trim(), state.trim()].filter(Boolean).join(", ");
}

export function PrivacyToolPage() {
  const { data, updateProfile, setStatus, clearAll, handled, total } = useSavedData();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const due = useMemo(
    () => BROKERS.filter((broker) => needsRecheck(data.progress[broker.id])),
    [data.progress],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return BROKERS.filter((broker) => {
      if (filter === "recheck" && !needsRecheck(data.progress[broker.id])) return false;
      if (filter === "people-search" && broker.category !== "people-search") return false;
      if (filter === "calls-and-junk" && broker.category !== "calls-and-junk") return false;
      if (!needle) return true;
      return `${broker.name} ${broker.blurb}`.toLowerCase().includes(needle);
    });
  }, [data.progress, filter, query]);

  const percent = total === 0 ? 0 : Math.round((handled / total) * 100);
  const nameCopy = joinedName(data.profile.firstName, data.profile.lastName);
  const placeCopy = cityAndState(data.profile.city, data.profile.state);
  const emailCopy = data.profile.email.trim();

  async function copyText(value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Copied.");
    } catch {
      setMessage("Select the text and copy it.");
    }
  }

  function onClear() {
    const ok = window.confirm(
      "Erase your name and progress from this browser? This does not reset today’s AI letter count.",
    );
    if (!ok) return;
    clearAll();
    setMessage("Cleared the data saved in this browser.");
  }

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Privacy Tool</h1>
        <p>
          Add your name to build search links. Then mark each site as you go. A reminder shows up
          here 90 days after you last updated a row.
        </p>
      </header>

      <section className="panel" aria-labelledby="progress-title">
        <div className="split">
          <h2 id="progress-title">Progress</h2>
          <p>
            {handled} of {total} started
          </p>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={handled}
          aria-label="Privacy Tool progress"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        {due.length > 0 ? (
          <p className="notice">
            Recheck {due.length} {due.length === 1 ? "item" : "items"} you updated at least 90 days
            ago: {due.map((item) => item.name).join(", ")}.
          </p>
        ) : null}
        <div className="row">
          <button type="button" className="button button-danger" onClick={onClear}>
            Clear all my data
          </button>
        </div>
        {message ? (
          <p role="status" className="hint">
            {message}
          </p>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="find-title">
        <h2 id="find-title">Find me</h2>
        <p className="hint">
          Saved only in this browser. Used to build your search links and letters. Websites can't
          auto-fill other sites' forms, so use the Copy buttons.
        </p>
        <div className="form-grid">
          <label>
            First name
            <input
              name="given-name"
              autoComplete="given-name"
              value={data.profile.firstName}
              onChange={(event) => updateProfile({ firstName: event.target.value })}
              onBlur={(event) => updateProfile({ firstName: event.target.value })}
            />
          </label>
          <label>
            Last name
            <input
              name="family-name"
              autoComplete="family-name"
              value={data.profile.lastName}
              onChange={(event) => updateProfile({ lastName: event.target.value })}
              onBlur={(event) => updateProfile({ lastName: event.target.value })}
            />
          </label>
          <label>
            City
            <input
              name="address-level2"
              autoComplete="address-level2"
              value={data.profile.city}
              onChange={(event) => updateProfile({ city: event.target.value })}
              onBlur={(event) => updateProfile({ city: event.target.value })}
            />
          </label>
          <label>
            State
            <select
              name="address-level1"
              autoComplete="address-level1"
              value={data.profile.state}
              onChange={(event) => updateProfile({ state: event.target.value })}
              onBlur={(event) => updateProfile({ state: event.target.value })}
            >
              <option value="">Select</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Email <span className="optional">optional</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={data.profile.email}
              onChange={(event) => updateProfile({ email: event.target.value })}
              onBlur={(event) => updateProfile({ email: event.target.value })}
            />
          </label>
          <label>
            Phone <span className="optional">optional</span>
            <input
              name="tel"
              type="tel"
              autoComplete="tel"
              value={data.profile.phone}
              onChange={(event) => updateProfile({ phone: event.target.value })}
              onBlur={(event) => updateProfile({ phone: event.target.value })}
            />
          </label>
        </div>
        <div className="row">
          <button
            type="button"
            className="button button-quiet copy-button"
            onClick={() => void copyText(nameCopy)}
            disabled={!nameCopy}
          >
            Copy name
          </button>
          <button
            type="button"
            className="button button-quiet copy-button"
            onClick={() => void copyText(placeCopy)}
            disabled={!placeCopy}
          >
            Copy city and state
          </button>
          <button
            type="button"
            className="button button-quiet copy-button"
            onClick={() => void copyText(emailCopy)}
            disabled={!emailCopy}
          >
            Copy email
          </button>
        </div>
      </section>

      <div className="toolbar">
        <label className="grow">
          <span className="sr">Search the list</span>
          <input
            placeholder="Search sites"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="filters" role="group" aria-label="Filter">
          {(
            [
              ["all", "All"],
              ["people-search", "People-search"],
              ["calls-and-junk", "Spam & mail"],
              ["recheck", "Recheck due"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "chip on" : "chip"}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="hint">
        Showing {visible.length} of {total}. Write a letter only shows up when that site needs a
        written request.
      </p>

      <div className="stack">
        {visible.map((broker) => (
          <BrokerCard
            key={broker.id}
            broker={broker}
            status={data.progress[broker.id]?.status ?? "not_started"}
            updatedAt={data.progress[broker.id]?.updatedAt ?? null}
            profile={data.profile}
            onStatus={(status) => setStatus(broker.id, status)}
          />
        ))}
      </div>
    </div>
  );
}

function BrokerCard({
  broker,
  status,
  updatedAt,
  profile,
  onStatus,
}: {
  broker: Broker;
  status: Status;
  updatedAt: string | null;
  profile: SavedData["profile"];
  onStatus: (status: Status) => void;
}) {
  const search = broker.searchUrlTemplate ? buildSearchUrl(broker.searchUrlTemplate, profile) : null;
  const phone = broker.phoneSearchUrl ? buildSearchUrl(broker.phoneSearchUrl, profile) : null;
  const recheck = needsRecheck({ status, updatedAt });

  return (
    <article className="card" id={broker.id}>
      <header className="card-head">
        <h2>{broker.name}</h2>
        <div className="tags">
          <span className={`tag tag-${broker.difficulty}`}>{broker.difficulty}</span>
          {broker.verification === "failed" ? <span className="flag">Link not verified</span> : null}
          {recheck ? <span className="flag">Recheck</span> : null}
        </div>
      </header>
      <p>{broker.blurb}</p>
      <ul className="needs">
        {broker.requiresEmail ? <li>Needs an email</li> : null}
        {broker.requiresId ? <li>May ask for an ID</li> : null}
        {broker.requiresPhone ? <li>May ask for a phone number</li> : null}
      </ul>
      <div className="row">
        <OptOutButton broker={broker} />
        {broker.letterRecommended ? (
          <Link className="button button-quiet" to={`/letters?broker=${broker.id}`}>
            Write a letter
          </Link>
        ) : null}
        {broker.searchUrlTemplate ? (
          search ? (
            <a className="button button-quiet" href={search} target="_blank" rel="noopener noreferrer">
              Search for me
            </a>
          ) : (
            <span className="hint">Add your name, city, and state to build a search link.</span>
          )
        ) : null}
        {broker.phoneSearchUrl ? (
          <a
            className="button button-quiet"
            href={phone ?? broker.phoneSearchUrl.split("{")[0]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Phone lookup
          </a>
        ) : null}
      </div>
      <StepList steps={broker.steps} />
      <div className="status-row">
        <label>
          Status for {broker.name}
          <select value={status} onChange={(event) => onStatus(event.target.value as Status)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="hint">{updatedAt && status !== "not_started" ? recheckLabel(updatedAt) : "Not updated yet"}</p>
      </div>
    </article>
  );
}
