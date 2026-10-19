import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BROKERS, type Broker, type Category } from "../../shared/brokers";
import { buildSearchUrl } from "../../shared/links";
import { needsRecheck, parseSavedData, RECHECK_DAYS, type SavedData, type Status } from "../../shared/progress";
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

function download(data: SavedData) {
  const file = {
    app: "opt-out-helper",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: data.profile,
    progress: data.progress,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "opt-out-helper.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function ChecklistPage() {
  const { data, updateProfile, setStatus, replaceAll, clearAll, handled, total } = useSavedData();
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

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseSavedData(JSON.parse(text));
      if (!parsed) {
        setMessage("That file is not an Opt Out Helper backup.");
        return;
      }
      replaceAll(parsed);
      setMessage("Backup imported. It replaced the checklist saved in this browser.");
    } catch {
      setMessage("Could not read that file.");
    }
  }

  function onClear() {
    const ok = window.confirm(
      "Erase your name and checklist from this browser? This does not reset today’s AI letter count.",
    );
    if (!ok) return;
    clearAll();
    setMessage("Cleared the data saved in this browser.");
  }

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Checklist</h1>
        <p>
          Add your name to build search links. Then mark each site as you go. A reminder shows up
          here 90 days after you last updated a row.
        </p>
      </header>

      <section className="panel" aria-labelledby="find-title">
        <h2 id="find-title">Find me</h2>
        <p className="hint">Saved only in this browser. Used for search links and letters.</p>
        <div className="form-grid">
          <label>
            First name
            <input
              autoComplete="given-name"
              value={data.profile.firstName}
              onChange={(event) => updateProfile({ firstName: event.target.value })}
            />
          </label>
          <label>
            Last name
            <input
              autoComplete="family-name"
              value={data.profile.lastName}
              onChange={(event) => updateProfile({ lastName: event.target.value })}
            />
          </label>
          <label>
            City
            <input
              autoComplete="address-level2"
              value={data.profile.city}
              onChange={(event) => updateProfile({ city: event.target.value })}
            />
          </label>
          <label>
            State
            <select
              autoComplete="address-level1"
              value={data.profile.state}
              onChange={(event) => updateProfile({ state: event.target.value })}
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
              type="email"
              autoComplete="email"
              value={data.profile.email}
              onChange={(event) => updateProfile({ email: event.target.value })}
            />
          </label>
          <label>
            Phone <span className="optional">optional</span>
            <input
              type="tel"
              autoComplete="tel"
              value={data.profile.phone}
              onChange={(event) => updateProfile({ phone: event.target.value })}
            />
          </label>
        </div>
      </section>

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
          aria-label="Checklist progress"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        {due.length > 0 ? (
          <p className="notice">
            Recheck {due.length} {due.length === 1 ? "item" : "items"} you updated at least 90 days
            ago: {due.map((item) => item.name).join(", ")}.
          </p>
        ) : (
          <p className="hint">Rows you finish will ask for a recheck 90 days later. No emails.</p>
        )}
        <div className="row">
          <button type="button" className="button button-quiet" onClick={() => download(data)}>
            Export progress
          </button>
          <label className="button button-quiet file-button">
            Import progress
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                void onImport(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
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
              ["calls-and-junk", "Calls & junk"],
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
        Showing {visible.length} of {total}.{" "}
        <Link to="/letters">Write a letter</Link> for a people-search site.
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
