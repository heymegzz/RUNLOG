import { Link } from 'react-router-dom';
import Logo from '../components/Brand/Logo';

const NotFound = () => {
  return (
    <div className="auth-main" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '420px' }}>
        <Logo to="/" size="md" className="empty-state-brand" />
        <h1 className="auth-title" style={{ fontSize: '3rem', marginTop: '1rem' }}>404</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-auth">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
