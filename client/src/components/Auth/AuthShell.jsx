import { Link } from 'react-router-dom';
import Logo from '../Brand/Logo';
import './auth.css';

const TERMINAL = {
  login: [
    { cmd: '$', text: 'runlog auth login', className: '' },
    { cmd: '→', text: 'POST /api/auth/login', className: 'run' },
    { cmd: ' ', text: '200 OK · session issued', className: 'ok' },
    { cmd: '→', text: 'subscribe jobs.live', className: 'run' },
    { cmd: ' ', text: '12 schedules · feed connected', className: 'ok' },
    { cmd: '●', text: 'ready', className: 'ok' },
  ],
  register: [
    { cmd: '$', text: 'runlog auth register', className: '' },
    { cmd: '→', text: 'POST /api/auth/register', className: 'run' },
    { cmd: ' ', text: '201 Created · workspace bootstrap', className: 'ok' },
    { cmd: '→', text: 'POST /api/jobs/sync', className: 'run' },
    { cmd: ' ', text: 'default cron policies applied', className: 'dim' },
    { cmd: '●', text: 'dashboard ready in 4.2s', className: 'ok' },
  ],
};

export default function AuthShell({
  mode = 'login',
  eyebrow,
  title,
  subtitle,
  children,
}) {
  const lines = TERMINAL[mode] || TERMINAL.login;

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Logo to="/" unified className="brand--nav" />
        <Link to="/" className="auth-topbar-home">
          ← Back to home
        </Link>
      </header>

      <div className="auth-stage">
        <div className="auth-panel">
          <aside className="auth-preview" aria-hidden>
            <div className="auth-preview-head">
              <p className="auth-preview-label">Control plane</p>
              <p className="auth-preview-title">
                {mode === 'register'
                  ? 'Spin up your workspace in minutes.'
                  : 'Pick up where your schedules left off.'}
              </p>
            </div>
            <div className="auth-terminal">
              <div className="auth-term-chrome">
                <span className="auth-term-dot" />
                <span className="auth-term-dot" />
                <span className="auth-term-dot" />
                <span className="auth-term-title">runlog — auth</span>
              </div>
              <div className="auth-term-body">
                {lines.map((line, i) => (
                  <div key={i} className="auth-term-line">
                    <span className={line.className}>{line.cmd}</span>
                    <span>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="auth-preview-stats">
              <div className="auth-stat">
                <div className="auth-stat-val">99.9%</div>
                <div className="auth-stat-label">Uptime</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-val">5 min</div>
                <div className="auth-stat-label">To first job</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-val">Live</div>
                <div className="auth-stat-label">Execution feed</div>
              </div>
            </div>
          </aside>

          <div className="auth-form-col">
            <header className="auth-form-head">
              {eyebrow && <p className="auth-form-eyebrow">{eyebrow}</p>}
              <h1 className="auth-form-title">{title}</h1>
              {subtitle && <p className="auth-form-sub">{subtitle}</p>}
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
