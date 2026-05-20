'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DecisionSummary, UserProfile } from '@/lib/types';

type AdminDecision = DecisionSummary & {
  user: UserProfile | null;
};

export default function AdminPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [decisions, setDecisions] = useState<AdminDecision[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasBackendAdmin = Boolean(token && user?.role === 'admin');

  useEffect(() => {
    if (!hasBackendAdmin) {
      return;
    }

    let isActive = true;

    const loadAdmin = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, decisionsData] = await Promise.all([
          apiRequest<UserProfile[]>('/admin/users', { token }),
          apiRequest<AdminDecision[]>('/admin/decisions', { token }),
        ]);
        if (!isActive) {
          return;
        }
        setUsers(usersData);
        setDecisions(decisionsData);
      } catch (err) {
        if (!isActive) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Admin fetch failed');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadAdmin();

    return () => {
      isActive = false;
    };
  }, [hasBackendAdmin, token]);

  const apiProviderName = 'Groq';
  const llmModelName = 'llama-3.3-70b-versatile';

  if (!hasBackendAdmin) {
    return (
      <div className="container section">
        <h1 className="section-title">Admin only</h1>
        <p className="section-subtitle">
          Please sign in as admin to access this dashboard.
        </p>
        <Link className="button primary" href="/admin/login">
          Admin login
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container section">
        <h1 className="section-title">Admin overview</h1>
        <p className="section-subtitle">
          Users: {users.length} | Decisions: {decisions.length}
        </p>
        {loading && <p className="section-subtitle">Loading data...</p>}
        {error && <p style={{ color: '#b42318' }}>{error}</p>}
        <div className="grid">
          <div className="card">
            <h3>API provider</h3>
            <p style={{ color: 'var(--muted)' }}>{apiProviderName}</p>
          </div>
          <div className="card">
            <h3>LLM model</h3>
            <p style={{ color: 'var(--muted)' }}>{llmModelName}</p>
          </div>
        </div>
        <div className="section" style={{ padding: 0 }}>
          <h2 className="section-title">Users</h2>
          <div className="grid">
            {users.map((profile) => (
              <div key={profile.id} className="card">
                <span className={`status-pill ${profile.role === 'admin' ? 'completed' : 'pending'}`}>
                  {profile.role}
                </span>
                <h3>{profile.name}</h3>
                <p style={{ color: 'var(--muted)' }}>@{profile.username}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid">
          {decisions.map((decision) => (
            <div key={decision.id} className="card">
              <span className={`status-pill ${decision.status}`}>
                {decision.status}
              </span>
              <h3>{decision.scenarioText}</h3>
              <p style={{ color: 'var(--muted)' }}>
                {decision.user?.username ?? 'Unknown'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
