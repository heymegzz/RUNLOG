import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthShell from '../components/Auth/AuthShell';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
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
      mode="login"
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Manage cron jobs, stream runs, and alert your team from one place."
    >
      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
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
          <label className="auth-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="auth-actions">
          <button type="submit" className="auth-btn auth-btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
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
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
