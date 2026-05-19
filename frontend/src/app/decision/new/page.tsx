'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { IntakeEntry, IntakeResponse } from '@/lib/types';

export default function NewDecisionPage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();
  const [scenario, setScenario] = useState('');
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [history, setHistory] = useState<IntakeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedScenario = scenario.trim();
  const isValidScenario = trimmedScenario.length >= 5;
  const trimmedAnswer = currentAnswer.trim();
  const isValidAnswer = trimmedAnswer.length >= 1;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?next=/decision/new');
    }
  }, [loading, user, router]);

  const handleScenarioSubmit = async (event: React.FormEvent) => {
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
      const intake = await apiRequest<IntakeResponse>('/decisions/intake/start', {
        method: 'POST',
        body: JSON.stringify({ scenarioText: trimmedScenario }),
        token,
      });

      if (intake.done) {
        router.push(`/decision/${intake.decisionId}/analysis`);
        return;
      }

      setDecisionId(intake.decisionId);
      setCurrentQuestion(intake.question ?? null);
      setCurrentAnswer('');
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start intake');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !decisionId) {
      setError('Please sign in before continuing.');
      return;
    }
    if (!currentQuestion) {
      setError('No follow-up question available.');
      return;
    }
    if (!isValidAnswer) {
      setError('Please add a bit more detail (minimum 1 character).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await apiRequest<IntakeResponse>('/decisions/intake/answer', {
        method: 'POST',
        body: JSON.stringify({ decisionId, answer: trimmedAnswer }),
        token,
      });

      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: trimmedAnswer },
      ]);

      if (response.done) {
        router.push(`/decision/${response.decisionId}/analysis`);
        return;
      }

      setCurrentQuestion(response.question ?? null);
      setCurrentAnswer('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container section">Loading...</div>;
  }

  if (!user) {
    return <div className="container section">Redirecting to sign in...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Describe your decision</h1>
          <p className="section-subtitle">
            Give DIA the scenario in plain language. We will ask follow-up
            questions to clarify the decision before analysis.
          </p>
          <form className="form" onSubmit={handleScenarioSubmit}>
            <div className="field">
              <label>Decision scenario</label>
              <textarea
                className="textarea"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                placeholder="Job vs Higher Study vs Startup"
                maxLength={1000}
                required
                disabled={Boolean(currentQuestion)}
              />
              <span className="tag">
                {trimmedScenario.length}/1000 characters
              </span>
            </div>
            {error && <p style={{ color: '#b42318' }}>{error}</p>}
            <button
              className="button primary"
              type="submit"
              disabled={submitting || !isValidScenario || Boolean(currentQuestion)}
            >
              {submitting ? 'Starting intake...' : 'Start intake'}
            </button>
          </form>

          {currentQuestion && (
            <div className="intake">
              <div className="intake-card">
                <div className="intake-label">Follow-up question</div>
                <div className="intake-question">{currentQuestion}</div>
                <form className="form" onSubmit={handleAnswerSubmit}>
                  <div className="field">
                    <label>Your answer</label>
                    <textarea
                      className="textarea"
                      value={currentAnswer}
                      onChange={(event) => setCurrentAnswer(event.target.value)}
                      placeholder="Share details that matter for this decision"
                      maxLength={1000}
                      required
                    />
                    <span className="tag">
                      {trimmedAnswer.length}/1000 characters
                    </span>
                  </div>
                  <button
                    className="button primary"
                    type="submit"
                    disabled={submitting || !isValidAnswer}
                  >
                    {submitting ? 'Submitting...' : 'Submit answer'}
                  </button>
                </form>
              </div>

              {history.length > 0 && (
                <div className="qa-stack">
                  {history.map((entry, index) => (
                    <div className="qa-item" key={`${entry.question}-${index}`}>
                      <div className="qa-label">Question {index + 1}</div>
                      <div className="qa-text">{entry.question}</div>
                      <div className="qa-label">Answer</div>
                      <div className="qa-text">{entry.answer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
