'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedUsername = username.trim();
  const isValidUsername = /^[a-zA-Z0-9_]{3,80}$/.test(trimmedUsername);
  const isValidPassword = password.length >= 8 && password.length <= 128;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setUsernameError(null);
    setPasswordError(null);
    setConfirmError(null);

    if (!isValidUsername) {
      setUsernameError('Username must be 3-80 characters (letters, numbers, _).');
    }
    if (!isValidPassword) {
      setPasswordError('Password must be 8-128 characters.');
    }
    if (!passwordsMatch) {
      setConfirmError('Passwords do not match.');
    }
    if (!isValidUsername || !isValidPassword || !passwordsMatch) {
      return;
    }
    setSubmitting(true);

    try {
      await register(trimmedUsername, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Create your account</h1>
          <p className="section-subtitle">
            Store every decision and revisit the full analysis later.
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {passwordError && <p className="field-error">{passwordError}</p>}
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                className="input"
                type="text"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              {confirmError && <p className="field-error">{confirmError}</p>}
            </div>
            {error && <p style={{ color: '#b42318' }}>{error}</p>}
            <button
              className="button primary"
              type="submit"
              disabled={submitting || loading}
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
            <p className="section-subtitle">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
