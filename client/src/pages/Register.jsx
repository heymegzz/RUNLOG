import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthShell from '../components/Auth/AuthShell';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, login, isAuthenticated, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ name, email, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    const success = await login({ email: 'demo@runlog.dev', password: 'demo123' });
    if (success) navigate('/dashboard');
  };

  return (
    <AuthShell
      mode="register"
      eyebrow="Get started"
      title="Create your account"
      subtitle="Free tier includes 5 jobs and a live feed — no credit card required."
    >
      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-name">Name</label>
          <input
            id="reg-name"
            type="text"
            className="auth-input"
            placeholder="Alex Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className="auth-input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className="auth-input"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="auth-actions">
          <button type="submit" className="auth-btn auth-btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      <div className="auth-or">or</div>
      <button
        type="button"
        className="auth-btn auth-btn-ghost"
        onClick={handleDemoLogin}
        disabled={isLoading}
      >
        Continue with demo account
      </button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default Register;
