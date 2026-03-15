import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return setError('All fields are required.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
          <p>Create your account — get ₹10,000 free</p>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name" type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email" type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password" type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              name="confirm" type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
