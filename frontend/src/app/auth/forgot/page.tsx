'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

type ForgotResponse = {
  ok: boolean;
  resetToken?: string;
};

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedUsername = username.trim();
  const isValidUsername = /^[a-zA-Z0-9_]{3,80}$/.test(trimmedUsername);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setResetToken(null);

    if (!isValidUsername) {
      setError('Username must be 3-80 characters (letters, numbers, _).');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<ForgotResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username: trimmedUsername }),
      });
      setMessage('If the account exists, a reset code is ready.');
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Forgot password</h1>
          <p className="section-subtitle">
            Enter your username to receive a reset code.
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
            </div>
            {error && <p className="field-error">{error}</p>}
            {message && <p className="section-subtitle">{message}</p>}
            {resetToken && (
              <p className="section-subtitle">
                Reset code: <strong>{resetToken}</strong>
              </p>
            )}
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Requesting...' : 'Get reset code'}
            </button>
            <p className="section-subtitle">
              Continue to <Link href="/auth/reset">reset password</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
