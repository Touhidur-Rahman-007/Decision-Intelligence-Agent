'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { UserProfile } from '@/lib/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedUsername = username.trim();
  const isValidUsername = /^[a-zA-Z0-9_]{3,80}$/.test(trimmedUsername);
  const isValidPassword = password.length >= 8 && password.length <= 128;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setUsernameError(null);
    setPasswordError(null);

    if (!isValidUsername) {
      setUsernameError('Username must be 3-80 characters (letters, numbers, _).');
    }
    if (!isValidPassword) {
      setPasswordError('Password must be 8-128 characters.');
    }
    if (!isValidUsername || !isValidPassword) {
      return;
    }

    setSubmitting(true);

    try {
      await login(trimmedUsername, password);
      const token = window.localStorage.getItem('dia_token');
      if (!token) {
        throw new Error('Admin login failed');
      }
      const profile = await apiRequest<UserProfile>('/users/me', { token });
      if (profile.role !== 'admin') {
        logout();
        setError('Admin login only.');
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Admin login</h1>
          <p className="section-subtitle">
            Enter admin credentials to access the admin dashboard.
          </p>
          <form className="form section-card" onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input
                className="input"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              {usernameError && <p className="field-error">{usernameError}</p>}
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="text"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {passwordError && <p className="field-error">{passwordError}</p>}
            </div>
            {error && <p style={{ color: '#b42318' }}>{error}</p>}
            <button
              className="button primary"
              type="submit"
              disabled={submitting || loading}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="section-subtitle">
              Back to <Link href="/auth/login">user login</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
