import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { brokersByCategory } from "../../shared/brokers";
import { validateLetterRequest, type LetterType } from "../../shared/letter";
import { BROKERS } from "../../shared/brokers";
import { privacyLawFor } from "../../shared/privacy-laws";
import { buildTemplateLetter } from "../../shared/templates";
import { US_STATES } from "../../shared/states";
import { useSavedData } from "../lib/storage";

const TYPES: { value: LetterType; label: string; help: string }[] = [
  {
    value: "general",
    label: "General removal request",
    help: "A plain request to take down your listing.",
  },
  {
    value: "ccpa",
    label: "State privacy deletion request",
    help: "Asks them to delete your information. Names a state privacy law only when that state gives a deletion right.",
  },
  {
    value: "followup",
    label: "Follow-up after no response",
    help: "Use this if you already asked and heard nothing.",
  },
];

type ApiBody = {
  letter?: string;
  source?: string;
  message?: string;
  error?: string;
  remaining?: number;
};

export function LettersPage() {
  const sites = useMemo(() => brokersByCategory("people-search"), []);
  const recommended = useMemo(() => sites.filter((site) => site.letterRecommended), [sites]);
  const [params] = useSearchParams();
  const requestedId = params.get("broker") ?? "";
  const { data, updateProfile } = useSavedData();
  const [showAll, setShowAll] = useState(() => {
    const requested = sites.find((site) => site.id === requestedId);
    return Boolean(requested && !requested.letterRecommended);
  });
  const [brokerId, setBrokerId] = useState(() => {
    if (sites.some((site) => site.id === requestedId)) return requestedId;
    return recommended[0]?.id ?? sites[0]?.id ?? "";
  });
  const [letterType, setLetterType] = useState<LetterType>("general");
  const [notes, setNotes] = useState("");
  const [letter, setLetter] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const listed = showAll ? sites : recommended;
  const broker = sites.find((item) => item.id === brokerId) ?? listed[0];

  useEffect(() => {
    const requested = sites.find((site) => site.id === requestedId);
    if (!requested) return;
    setBrokerId(requested.id);
    if (!requested.letterRecommended) setShowAll(true);
  }, [requestedId, sites]);

  function toggleShowAll() {
    setShowAll((current) => {
      const next = !current;
      if (!next && !recommended.some((site) => site.id === brokerId)) {
        setBrokerId(recommended[0]?.id ?? "");
      }
      return next;
    });
  }

  function draftFromTemplate(): string {
    if (!broker) return "";
    return buildTemplateLetter(
      {
        letterType,
        brokerId: broker.id,
        firstName: data.profile.firstName.trim(),
        lastName: data.profile.lastName.trim(),
        city: data.profile.city.trim(),
        state: data.profile.state,
        email: data.profile.email.trim(),
        phone: data.profile.phone.trim(),
        notes: notes.trim(),
      },
      broker.name,
    );
  }

  function useTemplate() {
    const checked = validateLetterRequest(
      {
        letterType,
        brokerId,
        ...data.profile,
        notes,
      },
      BROKERS,
    );
    if (!checked.ok) {
      setStatus(checked.error);
      return;
    }
    setLetter(buildTemplateLetter(checked.value, checked.broker.name));
    setStatus("This copy was written on your device. No AI request was sent.");
  }

  async function writeWithAi() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterType,
          brokerId,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          city: data.profile.city,
          state: data.profile.state,
          email: data.profile.email,
          phone: data.profile.phone,
          notes,
        }),
      });
      const body = (await response.json()) as ApiBody;
      if (response.ok && body.letter) {
        setLetter(body.letter);
        const left =
          typeof body.remaining === "number"
            ? ` ${body.remaining} AI ${body.remaining === 1 ? "letter" : "letters"} left today.`
            : "";
        setStatus(
          body.source === "mock"
            ? `Sample letter for this local preview.${left}`
            : `Letter ready.${left}`,
        );
        return;
      }
      if (body.error === "cap") {
        setLetter(draftFromTemplate());
        setStatus(body.message ?? "You've used today's 10 AI letters — use the template below or come back tomorrow.");
        return;
      }
      setLetter(draftFromTemplate());
      setStatus(body.message ?? "The AI helper did not answer. The template is in the box below.");
    } catch {
      setLetter(draftFromTemplate());
      setStatus("The AI helper did not answer. The template is in the box below.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLetter() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setStatus("Copied.");
    } catch {
      setStatus("Select the letter and copy it from the box.");
    }
  }

  return (
    <div className="stack">
      <header className="page-intro">
        <h1>Removal letters</h1>
        <p>
          Most sites just need the opt-out form. Use a letter when a site asks for an email request,
          ignores you, or when you want a formal state-privacy deletion request.
        </p>
        <p>
          Pick a site and a letter type. Write with AI uses today’s limit of 10 letters. The
          template works with no AI, including after the limit is used up.
        </p>
      </header>

      <section className="panel">
        <div className="form-grid">
          <label className="span-2">
            Site
            <select value={broker?.id ?? ""} onChange={(event) => setBrokerId(event.target.value)}>
              {listed.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2 show-all">
            <input type="checkbox" checked={showAll} onChange={toggleShowAll} />
            Show all sites
          </label>
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

        <fieldset className="types">
          <legend>Letter type</legend>
          {TYPES.map((type) => (
            <label key={type.value} className="choice">
              <input
                type="radio"
                name="letter-type"
                value={type.value}
                checked={letterType === type.value}
                onChange={() => setLetterType(type.value)}
              />
              <span>
                <strong>{type.label}</strong>
                <span className="hint">{type.help}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {letterType === "ccpa" && data.profile.state && !privacyLawFor(data.profile.state) ? (
          <p className="hint" role="note">
            Your state may not have a privacy law that requires deletion; this letter asks politely instead.
          </p>
        ) : null}

        <label>
          Extra notes <span className="optional">optional, 400 characters</span>
          <textarea
            maxLength={400}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Example: please remove the listing at this page address."
          />
        </label>

        <div className="row">
          <button type="button" className="button" onClick={() => void writeWithAi()} disabled={busy}>
            {busy ? "Writing…" : "Write with AI"}
          </button>
          <button type="button" className="button button-quiet" onClick={useTemplate}>
            Use the template instead
          </button>
        </div>
        {status ? (
          <p role="status" className="notice">
            {status}
          </p>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="letter-title">
        <div className="split">
          <h2 id="letter-title">Your letter</h2>
          <button type="button" className="button button-quiet" onClick={() => void copyLetter()} disabled={!letter}>
            Copy
          </button>
        </div>
        <textarea className="letter-box" readOnly rows={16} value={letter} aria-label="Letter text" />
        <p className="hint">Read it before you send it. This is a starting point, not legal advice.</p>
      </section>
    </div>
  );
}
