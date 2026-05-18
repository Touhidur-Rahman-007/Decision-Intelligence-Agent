'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DecisionSummary } from '@/lib/types';

export default function DashboardPage() {
  const { token, user, loading } = useAuth();
  const [decisions, setDecisions] = useState<DecisionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiRequest<DecisionSummary[]>('/decisions', { token })
      .then((data) => setDecisions(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load decisions'),
      );
  }, [token]);

  if (loading) {
    return <div className="container section">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container section">
        <h1 className="section-title">Sign in required</h1>
        <p className="section-subtitle">
          Please <Link href="/auth/login">sign in</Link> to view your decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Decision history</h1>
          <p className="section-subtitle">
            Welcome back, {user.name}. Review and reopen any previous analysis.
          </p>
          <div className="hero-cta">
            <Link className="button primary" href="/decision/new">
              New decision
            </Link>
          </div>
          {error && <p style={{ color: '#b42318' }}>{error}</p>}
          <div className="grid">
            {decisions.length === 0 ? (
              <div className="card">
                <h3>No decisions yet</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Start your first decision to see the full analysis.
                </p>
              </div>
            ) : (
              decisions.map((decision) => (
                <div key={decision.id} className="card">
                  <span className={`status-pill ${decision.status}`}>
                    {decision.status}
                  </span>
                  <h3>{decision.scenarioText}</h3>
                  <p style={{ color: 'var(--muted)' }}>
                    {new Date(decision.createdAt).toLocaleString()}
                  </p>
                  <Link
                    className="button ghost"
                    href={`/decision/${decision.id}/analysis`}
                  >
                    View analysis
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
