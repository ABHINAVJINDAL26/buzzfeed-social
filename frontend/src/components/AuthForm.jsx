import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthForm({ mode, onSubmit, loading, errorMessage, children }) {
  const isSignup = mode === 'signup';

  const [form, setForm] = useState({
    username: '',
    email: '',
    identifier: '', // Used for login
    password: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="auth-wrapper">
      {/* Top Logo Section */}
      <div className="auth-header-brand">
        <div className="auth-trophy-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00E1FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"></path>
          </svg>
        </div>
        <h1 className="auth-logo-title">NOVA<span className="auth-logo-dot"></span></h1>
        <p className="auth-logo-sub">SECURE PLATFORM ACCESS</p>
      </div>

      {/* Detached Tabs */}
      <div className="auth-tabs-detached">
        <Link className={`auth-tab ${!isSignup ? 'active' : ''}`} to="/login">
          Sign In
        </Link>
        <Link className={`auth-tab ${isSignup ? 'active' : ''}`} to="/signup">
          Create Account
        </Link>
      </div>

      {/* Form Card */}
      <form className="card auth-form" onSubmit={handleSubmit}>
        <div className="auth-heading-row">
          <h1>{isSignup ? 'Create Account 👋' : 'Welcome back 👋'}</h1>
          <p className="muted">
            {isSignup
              ? 'Join our community and start sharing updates.'
              : 'Sign in to your secure social account.'}
          </p>
        </div>

        {isSignup ? (
          <label className="auth-field">
            <span className="auth-label">Username</span>
            <div className="input-group">
              <span className="input-icon">@</span>
              <input
                className="input pill-input"
                type="text"
                name="username"
                placeholder="Enter username"
                minLength={3}
                maxLength={30}
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </label>
        ) : null}

        {!isSignup ? (
          <label className="auth-field">
            <span className="auth-label">Username or Email</span>
            <div className="input-group">
              <span className="input-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input
                className="input pill-input"
                type="text"
                name="identifier"
                placeholder="Enter username or email"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>
          </label>
        ) : (
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <div className="input-group">
              <span className="input-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <input
                className="input pill-input"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>
        )}

        <label className="auth-field">
          <span className="auth-label">Password</span>
          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
            <input
              className="input pill-input"
              type="password"
              name="password"
              placeholder="Enter password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </label>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button className="button button-primary auth-submit" disabled={loading} type="submit">
          {loading ? (
            <>
              <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }}></span>
              <span>Please wait...</span>
            </>
          ) : isSignup ? (
            <>Create Account <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
          ) : (
            <>Sign In <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
          )}
        </button>

        {children}
      </form>
    </div>
  );
}
