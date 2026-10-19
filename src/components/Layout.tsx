import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/checklist", label: "Checklist", end: false },
  { to: "/letters", label: "Letters", end: false },
  { to: "/spam", label: "Calls & junk", end: false },
  { to: "/faq", label: "FAQ", end: false },
  { to: "/privacy", label: "Privacy", end: false },
];

export function Layout() {
  return (
    <div className="shell">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="top">
        <NavLink className="brand" to="/" end>
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16 2.2 26.5 6.2v8.1c0 6.7-4.3 11.2-10.5 13.7C9.8 25.5 5.5 21 5.5 14.3V6.2L16 2.2z"
            />
            <rect x="11.4" y="14.2" width="9.2" height="7.2" rx="1.4" fill="#f7fbf9" />
            <path
              d="M13.2 14.2v-1.6a2.8 2.8 0 0 1 5.6 0v1.6"
              fill="none"
              stroke="#f7fbf9"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span>Opt Out Helper</span>
        </NavLink>
        <nav className="nav" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="content" className="content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Not legal advice. Not affiliated with any listed site.</p>
        <p>Your name and checklist stay in this browser.</p>
      </footer>
    </div>
  );
}
