'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(name, email, password);
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
              <label>Name</label>
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
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
