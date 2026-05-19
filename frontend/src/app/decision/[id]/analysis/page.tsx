'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { OutcomeCards } from '@/components/OutcomeCards';
import { RadarChart } from '@/components/RadarChart';
import { RecommendationPanel } from '@/components/RecommendationPanel';
import { RevealSection } from '@/components/RevealSection';
import { RiskMeters } from '@/components/RiskMeters';
import { ScoreMatrix } from '@/components/ScoreMatrix';
import { TradeoffBars } from '@/components/TradeoffBars';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DecisionDetail } from '@/lib/types';

const sectionTitles = [
  'Decision overview',
  'Criteria and scoring',
  'Trade-off analysis',
  'Risk dashboard',
  'Outcome simulation',
  'Final recommendation',
];

const progressSteps = [
  'Reading your decision',
  'Identifying evaluation criteria',
  'Scoring each option',
  'Detecting trade-offs',
  'Estimating risks',
  'Simulating outcomes',
  'Generating recommendation',
];

export default function AnalysisPage() {
  const params = useParams();
  const decisionId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { token, user, loading } = useAuth();
  const [decision, setDecision] = useState<DecisionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [progressStep, setProgressStep] = useState(0);

  const fetchDecision = useCallback(
    async (silent = false) => {
      if (!token || !decisionId) {
        return;
      }

      if (!silent) {
        setPageLoading(true);
      }

      setError(null);
      try {
        const data = await apiRequest<DecisionDetail>(
          `/decisions/${decisionId}`,
          { token },
        );
        setDecision(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load analysis',
        );
      } finally {
        if (!silent) {
          setPageLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [decisionId, token],
  );

  useEffect(() => {
    if (!loading && !user) {
      const next = decisionId ? `/decision/${decisionId}/analysis` : '/dashboard';
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!token || !decisionId) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchDecision();
    }, 0);

    return () => clearTimeout(timeout);
  }, [token, decisionId, fetchDecision, loading, user, router]);

  useEffect(() => {
    if (!decision || decision.status === 'completed' || decision.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      setRefreshing(true);
      fetchDecision(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [decision, fetchDecision]);

  useEffect(() => {
    if (!decision?.result) {
      return;
    }

    let index = 0;
    const raf = requestAnimationFrame(() => setActiveSection(0));
    const interval = setInterval(() => {
      index += 1;
      setActiveSection(index);
      if (index >= sectionTitles.length - 1) {
        clearInterval(interval);
      }
    }, 800);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [decision?.result]);

  useEffect(() => {
    if (decision?.status !== 'pending') {
      return;
    }

    const raf = requestAnimationFrame(() => setProgressStep(0));
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev + 1) % progressSteps.length);
    }, 700);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [decision?.status]);

  if (pageLoading) {
    return <div className="container section">Loading analysis...</div>;
  }

  if (!token || !user) {
    return <div className="container section">Redirecting to sign in...</div>;
  }

  if (error) {
    return <div className="container section">{error}</div>;
  }

  if (!decision) {
    return <div className="container section">Decision not found.</div>;
  }

  if (decision.status === 'failed') {
    return (
      <div className="container section">
        <h1 className="section-title">Analysis failed</h1>
        <p className="section-subtitle">
          The system could not complete the analysis. Try again later.
        </p>
      </div>
    );
  }

  if (decision.status !== 'completed' || !decision.result) {
    return (
      <div className="container section">
        <h1 className="section-title">Analysis in progress</h1>
        <p className="section-subtitle">
          The analysis is still running. This page refreshes automatically.
        </p>
        <div className="analysis-theatre">
          <div className="steps">
            {progressSteps.map((step, index) => (
              <div
                key={step}
                className={`step ${index <= progressStep ? 'active' : ''}`}
              >
                <span>{step}</span>
                <span className="tag">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
        {refreshing && <p className="section-subtitle">Refreshing...</p>}
      </div>
    );
  }

  const { result } = decision;

  return (
    <div className="page">
      <div className="container section">
        <h1 className="section-title">Decision analysis</h1>
        <p className="section-subtitle">{decision.scenarioText}</p>

        <RevealSection
          title={sectionTitles[0]}
          index={0}
          activeIndex={activeSection}
        >
          <div className="grid">
            {result.options.map((option) => (
              <div key={option} className="card">
                <div className="pill">Option</div>
                <h3>{option}</h3>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection
          title={sectionTitles[1]}
          index={1}
          activeIndex={activeSection}
        >
          <div className="grid">
            <div className="card" style={{ alignItems: 'center' }}>
              <RadarChart
                options={result.options}
                criteria={result.criteria}
                scores={result.scores}
              />
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <ScoreMatrix
                options={result.options}
                criteria={result.criteria}
                scores={result.scores}
              />
            </div>
          </div>
        </RevealSection>

        <RevealSection
          title={sectionTitles[2]}
          index={2}
          activeIndex={activeSection}
        >
          <TradeoffBars tradeoffs={result.tradeoffs} />
        </RevealSection>

        <RevealSection
          title={sectionTitles[3]}
          index={3}
          activeIndex={activeSection}
        >
          <RiskMeters risks={result.risks} />
        </RevealSection>

        <RevealSection
          title={sectionTitles[4]}
          index={4}
          activeIndex={activeSection}
        >
          <OutcomeCards simulation={result.simulation} />
        </RevealSection>

        <RevealSection
          title={sectionTitles[5]}
          index={5}
          activeIndex={activeSection}
        >
          <RecommendationPanel recommendation={result.recommendation} />
        </RevealSection>
      </div>
    </div>
  );
}
