'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DecisionDetail } from '@/lib/types';

const steps = [
  'Reading your decision',
  'Identifying evaluation criteria',
  'Scoring each option',
  'Detecting trade-offs',
  'Estimating risks',
  'Simulating outcomes',
  'Generating recommendation',
];

export default function NewDecisionPage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();
  const [scenario, setScenario] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const trimmedScenario = scenario.trim();
  const isValidScenario = trimmedScenario.length >= 5;

  useEffect(() => {
    if (!submitting) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 700);

    return () => clearInterval(interval);
  }, [submitting]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError('Please sign in before creating a decision.');
      return;
    }
    if (!isValidScenario) {
      setError('Please add a bit more detail (minimum 5 characters).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const decision = await apiRequest<DecisionDetail>('/decisions', {
        method: 'POST',
        body: JSON.stringify({ scenarioText: trimmedScenario }),
        token,
      });

      router.push(`/decision/${decision.id}/analysis`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container section">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container section">
        <h1 className="section-title">Sign in required</h1>
        <p className="section-subtitle">
          Please <Link href="/auth/login">sign in</Link> to create a decision.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Describe your decision</h1>
          <p className="section-subtitle">
            Give DIA the scenario in plain language. The system does the rest.
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Decision scenario</label>
              <textarea
                className="textarea"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                placeholder="Job vs Higher Study vs Startup"
                maxLength={1000}
                required
              />
              <span className="tag">
                {trimmedScenario.length}/1000 characters
              </span>
            </div>
            {error && <p style={{ color: '#b42318' }}>{error}</p>}
            <button
              className="button primary"
              type="submit"
              disabled={submitting || !isValidScenario}
            >
              {submitting ? 'Analyzing...' : 'Run analysis'}
            </button>
          </form>

          {submitting && (
            <div className="analysis-theatre">
              <div className="steps">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`step ${index <= activeStep ? 'active' : ''}`}
                  >
                    <span>{step}</span>
                    <span className="tag">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
