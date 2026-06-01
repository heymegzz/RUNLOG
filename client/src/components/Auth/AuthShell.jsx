import { Link } from 'react-router-dom';
import Logo from '../Brand/Logo';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Logo to="/" size="lg" className="auth-aside-logo" />
        <p className="auth-aside-tagline">
          Schedule HTTP jobs. Stream every execution. Ship with retries and alerts built in.
        </p>
        <ul className="auth-aside-points">
          <li>Cron schedules on your endpoints</li>
          <li>Live execution feed</li>
          <li>Team access &amp; API keys</li>
        </ul>
        <Link to="/" className="auth-aside-back">
          ← Back to home
        </Link>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-head">
            <Logo to="/" size="sm" className="auth-card-logo-mobile" />
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
