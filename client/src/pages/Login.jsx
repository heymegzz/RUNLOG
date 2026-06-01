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
    setEmail('demo@runlog.dev');
    setPassword('demo123');
    const success = await login({ email: 'demo@runlog.dev', password: 'demo123' });
    if (success) navigate('/dashboard');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your scheduled jobs">
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-auth" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-divider">or</p>
      <button
        type="button"
        className="btn btn-secondary btn-auth"
        onClick={handleDemoLogin}
        disabled={isLoading}
      >
        Try demo — no signup needed
      </button>

      <div className="auth-link">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </div>
    </AuthShell>
  );
};

export default Login;
