import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

/* ── Fake execution log data that loops ── */
const LOG_ROWS = [
  { time: '09:00:01', name: 'send-digest',       status: '200 OK',   dur: '142ms', type: 'ok',   icon: '✓' },
  { time: '09:00:03', name: 'sync-inventory',     status: '200 OK',   dur: '89ms',  type: 'ok',   icon: '✓' },
  { time: '09:01:00', name: 'process-payments',   status: '503 ERR',  dur: '—',     type: 'warn', icon: '↻ retry 1/3' },
  { time: '09:01:05', name: 'process-payments',   status: '200 OK',   dur: '312ms', type: 'ok',   icon: '✓' },
  { time: '09:02:00', name: 'purge-cache',        status: '200 OK',   dur: '44ms',  type: 'ok',   icon: '✓' },
  { time: '09:03:00', name: 'send-digest',        status: 'timeout',  dur: '—',     type: 'err',  icon: '✗ alerted' },
  { time: '09:04:00', name: 'health-check',       status: '200 OK',   dur: '18ms',  type: 'ok',   icon: '✓' },
  { time: '09:05:00', name: 'sync-orders',        status: '200 OK',   dur: '203ms', type: 'ok',   icon: '✓' },
];

/* ── Scroll-reveal observer ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Animated Terminal ── */
const Terminal = () => {
  const [visibleRows, setVisibleRows] = useState([]);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextRow = LOG_ROWS[indexRef.current % LOG_ROWS.length];
      setVisibleRows(prev => {
        const updated = [...prev, { ...nextRow, key: Date.now() }];
        return updated.slice(-7);
      });
      indexRef.current++;
    }, 1800);
    // Kick off immediately
    const firstRow = LOG_ROWS[0];
    setVisibleRows([{ ...firstRow, key: Date.now() }]);
    indexRef.current = 1;
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="land-terminal">
      <div className="land-terminal-bar">
        <div className="land-terminal-dots">
          <span /><span /><span />
        </div>
        <div className="land-terminal-title">execution_log — workspace: acme-corp</div>
      </div>
      <div className="land-terminal-body">
        {visibleRows.map((row, i) => (
          <div
            key={row.key}
            className="land-log-row"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div><div className={`land-log-dot ${row.type}`} /></div>
            <div className="land-log-time">{row.time}</div>
            <div className="land-log-name">{row.name}</div>
            <div className={`land-log-status ${row.type}`}>{row.status}</div>
            <div className="land-log-dur">{row.dur}</div>
            <div className={`land-log-icon ${row.type}`}>{row.icon.charAt(0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── FEATURES DATA ── */
const FEATURES = [
  { icon: '↻', title: 'Retry Engine', desc: 'Exponential backoff, configurable attempts. Failures recover themselves.' },
  { icon: '◉', title: 'Live Execution Feed', desc: 'WebSocket-powered. See every job fire in real time, no refresh.' },
  { icon: '⚡', title: 'Failure Alerts', desc: 'Email and Slack. Know before your users do.' },
  { icon: '⊞', title: 'Team RBAC', desc: 'Owners, Admins, Developers. One workspace, right access for everyone.' },
  { icon: '⌗', title: 'API Key Auth', desc: 'Trigger jobs programmatically from CI pipelines or scripts.' },
  { icon: '▤', title: 'Execution History', desc: 'Full log, paginated, filterable by status. Every run, forever.' },
];

/* ── PREVIEW TABLE DATA ── */
const PREVIEW_ROWS = [
  { name: 'send-digest',     status: 'ok',   time: '2m ago',  dur: '142ms' },
  { name: 'sync-inventory',  status: 'ok',   time: '3m ago',  dur: '89ms' },
  { name: 'process-payments', status: 'warn', time: '4m ago',  dur: '312ms' },
  { name: 'purge-cache',     status: 'ok',   time: '5m ago',  dur: '44ms' },
  { name: 'send-digest',     status: 'err',  time: '8m ago',  dur: '—' },
];

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Landing = () => {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* ── NAV ── */}
      <nav className="land-nav">
        <Link to="/" className="land-nav-logo">
          <div className="land-nav-dot" />
          <span className="land-nav-wordmark">Runlog</span>
        </Link>
        <div className="land-nav-links">
          <a href="#features" className="land-nav-link">Features</a>
          <a href="#pricing" className="land-nav-link">Pricing</a>
          <Link to="/login" className="land-nav-link">Sign in</Link>
          <Link to="/register" className="land-nav-cta">Start for free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="land-hero">
        <div className="land-hero-left">
          <div className="land-hero-overline">Scheduled jobs. Real-time logs.</div>
          <h1 className="land-hero-headline">
            Your cron jobs,<br />
            finally <em>visible.</em>
          </h1>
          <p className="land-hero-sub">
            Register HTTP callbacks, set a schedule, and watch every execution in
            real time — with retries, alerts, and team access.
          </p>
          <div className="land-hero-ctas">
            <Link to="/register" className="btn btn-primary">Deploy your first job →</Link>
            <a href="#how-it-works" className="btn btn-secondary">See how it works</a>
          </div>
          <div className="land-hero-proof">
            <div className="land-hero-avatars">
              <div className="land-hero-avatar a1">JK</div>
              <div className="land-hero-avatar a2">AM</div>
              <div className="land-hero-avatar a3">SL</div>
              <div className="land-hero-avatar a4">RD</div>
            </div>
            <span className="land-hero-proof-text">Trusted by 400+ engineering teams</span>
          </div>
        </div>
        <div className="land-hero-right">
          <Terminal />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="land-section" ref={r1}>
        <div className="fade-up" ref={r1}>
          <div className="land-section-label">How it works</div>
          <h2 className="land-section-title">Three steps. No infrastructure to manage.</h2>
          <div className="land-steps" style={{ marginTop: '2.5rem' }}>
            <div className="land-step">
              <div className="land-step-number">01</div>
              <div className="land-step-title">Register</div>
              <div className="land-step-text">
                Point Runlog at any HTTP endpoint. Add a cron schedule, set your
                retry policy, attach headers or a payload. Done in 60 seconds.
              </div>
            </div>
            <div className="land-step">
              <div className="land-step-number">02</div>
              <div className="land-step-title">Schedule</div>
              <div className="land-step-text">
                Runlog's worker engine fires your job on time, every time. Failures
                retry automatically with exponential backoff. You don't babysit it.
              </div>
            </div>
            <div className="land-step">
              <div className="land-step-number">03</div>
              <div className="land-step-title">Watch</div>
              <div className="land-step-text">
                Every execution streams to your dashboard in real time. Status codes,
                durations, response snapshots — full history, always searchable.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="land-section" style={{ paddingTop: '2rem' }}>
        <div className="fade-up" ref={r2}>
          <div className="land-section-label">Features</div>
          <h2 className="land-section-title">Everything a production job needs</h2>
          <div className="land-features" style={{ marginTop: '2.5rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="land-feature">
                <div className="land-feature-icon">
                  <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                </div>
                <div className="land-feature-title">{f.title}</div>
                <div className="land-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="land-preview-section">
        <div className="fade-up" ref={r3}>
          <div className="land-section-label" style={{ textAlign: 'center' }}>Preview</div>
          <h2 className="land-section-title" style={{ textAlign: 'center', margin: '0 auto 2.5rem', maxWidth: '500px' }}>
            The dashboard your on-call rotation deserves
          </h2>
          <div className="land-preview-card">
            <div className="land-preview-inner">
              <div className="land-preview-sidebar">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)' }} />
                  acme-corp
                </div>
                <div className="land-preview-nav-item active">Dashboard</div>
                <div className="land-preview-nav-item">Jobs</div>
                <div className="land-preview-nav-item">Executions</div>
                <div className="land-preview-nav-item">Settings</div>
              </div>
              <div className="land-preview-main">
                <div className="land-preview-stats">
                  <div className="land-preview-stat">
                    <div className="land-preview-stat-val">1,204</div>
                    <div className="land-preview-stat-label">Runs today</div>
                  </div>
                  <div className="land-preview-stat">
                    <div className="land-preview-stat-val" style={{ color: 'var(--green)' }}>98.2%</div>
                    <div className="land-preview-stat-label">Success</div>
                  </div>
                  <div className="land-preview-stat">
                    <div className="land-preview-stat-val">143ms</div>
                    <div className="land-preview-stat-label">Avg duration</div>
                  </div>
                  <div className="land-preview-stat">
                    <div className="land-preview-stat-val" style={{ color: 'var(--red)' }}>2</div>
                    <div className="land-preview-stat-label">Alerts</div>
                  </div>
                </div>
                <table className="land-preview-table">
                  <thead><tr><th>Job</th><th>Status</th><th>Duration</th><th>Time</th></tr></thead>
                  <tbody>
                    {PREVIEW_ROWS.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                        <td>
                          <span className={`land-preview-badge ${r.status}`}>
                            {r.status === 'ok' ? '200 OK' : r.status === 'warn' ? 'RETRY' : 'FAILED'}
                          </span>
                        </td>
                        <td>{r.dur}</td>
                        <td>{r.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="land-section">
        <div className="fade-up" ref={r4}>
          <div className="land-section-label" style={{ textAlign: 'center' }}>Pricing</div>
          <h2 className="land-section-title" style={{ textAlign: 'center', margin: '0 auto 2.5rem' }}>Simple, honest pricing</h2>
          <div className="land-pricing">
            <div className="land-price-card">
              <div className="land-price-name">Free</div>
              <div className="land-price-amount">$0</div>
              <div className="land-price-period">forever for small projects</div>
              <ul className="land-price-features">
                <li>5 scheduled jobs</li>
                <li>1 workspace</li>
                <li>7-day execution history</li>
                <li>Community support</li>
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get started</Link>
            </div>
            <div className="land-price-card featured">
              <div className="land-price-name" style={{ color: 'var(--green)' }}>Pro</div>
              <div className="land-price-amount">$19</div>
              <div className="land-price-period">per month</div>
              <ul className="land-price-features">
                <li>Unlimited jobs</li>
                <li>3 workspaces</li>
                <li>90-day history</li>
                <li>Slack &amp; email alerts</li>
                <li>API key access</li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Start free trial →</Link>
            </div>
            <div className="land-price-card">
              <div className="land-price-name">Team</div>
              <div className="land-price-amount">$59</div>
              <div className="land-price-period">per month</div>
              <ul className="land-price-features">
                <li>Everything in Pro</li>
                <li>Full RBAC</li>
                <li>5 workspaces</li>
                <li>1-year history</li>
                <li>Priority support</li>
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Contact us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="land-section" style={{ paddingTop: '2rem' }}>
        <div className="fade-up" ref={r5}>
          <div className="land-section-label" style={{ textAlign: 'center' }}>From the field</div>
          <h2 className="land-section-title" style={{ textAlign: 'center', margin: '0 auto 2.5rem' }}>Engineers ship with Runlog</h2>
          <div className="land-testimonials">
            <div className="land-testimonial">
              <div className="land-testimonial-text">
                "We replaced a mess of Heroku Scheduler jobs and three different cron
                containers with Runlog. One dashboard, every team."
              </div>
              <div className="land-testimonial-author">Jamie Kowalski</div>
              <div className="land-testimonial-role">Staff Engineer, Meridian</div>
            </div>
            <div className="land-testimonial">
              <div className="land-testimonial-text">
                "The retry logic alone saved us three incidents. The failure alerts
                are the first thing we look at now."
              </div>
              <div className="land-testimonial-author">Priya Sharma</div>
              <div className="land-testimonial-role">SRE Lead, Canopy Health</div>
            </div>
            <div className="land-testimonial">
              <div className="land-testimonial-text">
                "We wire every background task through Runlog. It's the ops layer
                we always wished someone else would build."
              </div>
              <div className="land-testimonial-author">Marcus Chen</div>
              <div className="land-testimonial-role">CTO, Stackline</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="land-footer-cta">
        <h2 className="land-footer-cta-title">Ship your first scheduled job in 5 minutes.</h2>
        <p className="land-footer-cta-sub">Free forever for small teams. No credit card.</p>
        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.7rem 2rem' }}>
          Get started free →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="land-footer-copy">© 2025 Runlog</div>
        <div className="land-footer-links">
          <a href="#" className="land-footer-link">Privacy</a>
          <a href="#" className="land-footer-link">Terms</a>
          <a href="#" className="land-footer-link">Docs</a>
          <a href="#" className="land-footer-link land-footer-status">
            <span className="land-footer-status-dot" />
            Status
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
