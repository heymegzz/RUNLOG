import { Link } from 'react-router-dom';
import Logo from '../components/Brand/Logo';
import '../components/Auth/auth.css';

const NotFound = () => {
  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Logo to="/" unified className="brand--nav" />
        <Link to="/" className="auth-topbar-home">
          ← Back to home
        </Link>
      </header>
      <div className="auth-stage">
        <div className="auth-panel" style={{ gridTemplateColumns: '1fr', maxWidth: '420px' }}>
          <div className="auth-form-col" style={{ textAlign: 'center' }}>
            <header className="auth-form-head">
              <p className="auth-form-eyebrow">404</p>
              <h1 className="auth-form-title">Page not found</h1>
              <p className="auth-form-sub">This route doesn&apos;t exist or has been moved.</p>
            </header>
            <Link to="/" className="auth-btn auth-btn-primary">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
