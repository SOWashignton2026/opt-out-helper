import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BROKERS,
  FILTER_LABELS,
  TOOL_FILTERS,
  parseToolFilter,
  type Broker,
  type ToolFilter,
} from "../../shared/brokers";
import { buildSearchUrl, selfSearchUrl } from "../../shared/links";
import { CLEAR_DATA_CONFIRM, SHARED_COMPUTER_TIP, type SavedData, type Status } from "../../shared/progress";
import { PRIVACY_LAWS } from "../../shared/privacy-laws";
import { US_STATES } from "../../shared/states";
import { OptOutButton } from "../components/OptOutButton";
import { StepList } from "../components/StepList";
import { useSavedData } from "../lib/storage";

const LIMITED_STATE_NAMES = PRIVACY_LAWS.map(
  (law) => US_STATES.find((state) => state.code === law.state)?.name ?? law.state,
).join(", ");

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "submitted", label: "Submitted" },
  { value: "removed", label: "Removed" },
  { value: "not_listed", label: "Not listed" },
];

function joinedName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(" ");
}

function cityAndState(city: string, state: string): string {
  return [city.trim(), state.trim()].filter(Boolean).join(", ");
}

export function PrivacyToolPage() {
  const { data, updateProfile, setStatus, clearAll, handled, total } = useSavedData();
  const [params, setParams] = useSearchParams();
  const filter = parseToolFilter(params.get("filter"));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return BROKERS.filter((broker) => {
      if (filter !== "all" && broker.category !== filter) return false;
      if (!needle) return true;
      return `${broker.name} ${broker.blurb}`.toLowerCase().includes(needle);
    });
  }, [filter, query]);

  const percent = total === 0 ? 0 : Math.round((handled / total) * 100);
  const nameCopy = joinedName(data.profile.firstName, data.profile.lastName);
  const placeCopy = cityAndState(data.profile.city, data.profile.state);
  const emailCopy = data.profile.email.trim();
  const phoneCopy = data.profile.phone.trim();

  function chooseFilter(next: ToolFilter) {
    const updated = new URLSearchParams(params);
    if (next === "all") updated.delete("filter");
    else updated.set("filter", next);
    setParams(updated, { replace: true });
  }

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
    const ok = window.confirm(CLEAR_DATA_CONFIRM);
    if (!ok) return;
    clearAll();
    setMessage("Cleared the data saved in this browser.");
  }

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Privacy Tool</h1>
        <p>
          Fill out your information in the form below to use copy/paste feature. Then navigate
          through the list and follow the instructions. Once completed, change the status for your
          reference.
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
          <span data-n={percent} />
        </div>
        <div className="progress-actions">
          <button type="button" className="button button-danger" onClick={onClear}>
            Clear all my data
          </button>
          <p className="hint">{SHARED_COMPUTER_TIP}</p>
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
          <div className="field">
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
          </div>
          <div className="field">
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
            <button
              type="button"
              className="button button-quiet copy-button"
              onClick={() => void copyText(nameCopy)}
              disabled={!nameCopy}
            >
              Copy name
            </button>
          </div>
          <div className="field">
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
          </div>
          <div className="field">
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
            <button
              type="button"
              className="button button-quiet copy-button"
              onClick={() => void copyText(placeCopy)}
              disabled={!placeCopy}
            >
              Copy city & state
            </button>
          </div>
          <div className="field">
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
            <button
              type="button"
              className="button button-quiet copy-button"
              onClick={() => void copyText(emailCopy)}
              disabled={!emailCopy}
            >
              Copy email
            </button>
          </div>
          <div className="field">
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
            <button
              type="button"
              className="button button-quiet copy-button"
              onClick={() => void copyText(phoneCopy)}
              disabled={!phoneCopy}
            >
              Copy phone
            </button>
          </div>
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
          {TOOL_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "chip on" : "chip"}
              aria-pressed={filter === value}
              onClick={() => chooseFilter(value)}
            >
              {FILTER_LABELS[value]}
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
            profile={data.profile}
            onStatus={(status) => setStatus(broker.id, status)}
          />
        ))}
      </div>
    </div>
  );
}

function EmailBrokerActions({ broker }: { broker: Broker }) {
  const [note, setNote] = useState("");
  const address = broker.email ?? "";

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(address);
      setNote("Copied.");
    } catch {
      setNote("Select the text and copy it.");
    }
  }

  return (
    <>
      <a className="button button-primary" href={broker.optOutUrl}>
        Email them
      </a>
      <button type="button" className="button button-quiet" onClick={() => void copyEmail()}>
        Copy email
      </button>
      {note ? <span className="hint">{note}</span> : null}
    </>
  );
}

function BrokerCard({
  broker,
  status,
  profile,
  onStatus,
}: {
  broker: Broker;
  status: Status;
  profile: SavedData["profile"];
  onStatus: (status: Status) => void;
}) {
  const search = selfSearchUrl(broker, profile);
  const phone = broker.phoneSearchUrl ? buildSearchUrl(broker.phoneSearchUrl, profile) : null;

  return (
    <article className="card" id={broker.id}>
      <header className="card-head">
        <h2>{broker.name}</h2>
        <div className="tags">
          <span className={`tag tag-${broker.difficulty}`}>{broker.difficulty}</span>
          {broker.stateLimited ? <span className="tag">Privacy-law states</span> : null}
          {broker.linkNotVerified ? <span className="flag">Link not yet verified</span> : null}
          {!broker.linkNotVerified && broker.verification === "failed" ? (
            <span className="flag">Link not verified</span>
          ) : null}
        </div>
      </header>
      <p>{broker.blurb}</p>
      {broker.stateLimited ? (
        <p className="hint">Often only available if you live in {LIMITED_STATE_NAMES}.</p>
      ) : null}
      <ul className="needs">
        {broker.requiresEmail ? <li>Needs an email</li> : null}
        {broker.requiresId ? <li>May ask for an ID</li> : null}
        {broker.requiresPhone ? <li>May ask for a phone number</li> : null}
      </ul>
      {search || broker.phoneSearchUrl ? (
        <div className="row">
          {search ? (
            <a className="button button-quiet" href={search} target="_blank" rel="noopener noreferrer">
              Search me
            </a>
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
      ) : null}
      <StepList steps={broker.steps} />
      <div className="row card-actions">
        {broker.category === "nonpublic" && broker.email ? (
          <EmailBrokerActions broker={broker} />
        ) : (
          <OptOutButton broker={broker} />
        )}
        {broker.letterRecommended ? (
          <Link className="button button-quiet" to={`/letters?broker=${broker.id}`}>
            Write a letter
          </Link>
        ) : null}
      </div>
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
      </div>
    </article>
  );
}
