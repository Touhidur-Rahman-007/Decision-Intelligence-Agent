'use client';

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

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      return;
    }

    setLoading(true);
    Promise.all([
      apiRequest<UserProfile[]>('/admin/users', { token }),
      apiRequest<AdminDecision[]>('/admin/decisions', { token }),
    ])
      .then(([usersData, decisionsData]) => {
        setUsers(usersData);
        setDecisions(decisionsData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Admin fetch failed'),
      )
      .finally(() => setLoading(false));
  }, [token, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container section">
        <h1 className="section-title">Admin only</h1>
        <p className="section-subtitle">
          You do not have access to this dashboard.
        </p>
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
          {decisions.map((decision) => (
            <div key={decision.id} className="card">
              <span className={`status-pill ${decision.status}`}>
                {decision.status}
              </span>
              <h3>{decision.scenarioText}</h3>
              <p style={{ color: 'var(--muted)' }}>
                {decision.user?.email ?? 'Unknown'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
