'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedUsername = username.trim();
  const trimmedToken = resetToken.trim();
  const isValidUsername = /^[a-zA-Z0-9_]{3,80}$/.test(trimmedUsername);
  const isValidPassword = newPassword.length >= 8 && newPassword.length <= 128;
  const isValidToken = trimmedToken.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isValidUsername) {
      setError('Username must be 3-80 characters (letters, numbers, _).');
      return;
    }
    if (!isValidToken) {
      setError('Reset code is required.');
      return;
    }
    if (!isValidPassword) {
      setError('Password must be 8-128 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          username: trimmedUsername,
          resetToken: trimmedToken,
          newPassword,
        }),
      });
      setMessage('Password updated. You can now sign in.');
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Reset password</h1>
          <p className="section-subtitle">
            Enter your reset code and new password.
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
            <div className="field">
              <label>Reset code</label>
              <input
                className="input"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="text"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            {message && <p className="section-subtitle">{message}</p>}
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Reset password'}
            </button>
            <p className="section-subtitle">
              Back to <Link href="/auth/login">sign in</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
