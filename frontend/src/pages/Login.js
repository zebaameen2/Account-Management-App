import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return setError('Email and password are required.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">💰</div>
          <h1>Vault</h1>
          <p>Welcome back — sign in to continue</p>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email" type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password" type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
