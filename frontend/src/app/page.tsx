import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <main className="container">
        <section className="hero">
          <div>
            <span className="badge">Decision Theatre</span>
            <h1 className="hero-title">
              Turn a messy decision into a cinematic intelligence briefing.
            </h1>
            <p className="hero-subtitle">
              Describe the scenario once. DIA identifies the options, scores the
              criteria, surfaces trade-offs, estimates risk, simulates outcomes,
              and explains a clear recommendation.
            </p>
            <div className="hero-cta">
              <Link className="button primary" href="/decision/new">
                Start a decision
              </Link>
              <Link className="button ghost" href="/auth/login">
                Sign in
              </Link>
            </div>
          </div>
          <div className="section-card reveal">
            <div className="tag">Live analysis preview</div>
            <div className="analysis-theatre" style={{ marginTop: 16 }}>
              <div className="steps">
                <div className="step active">
                  <span>Reading your decision</span>
                  <span className="tag">01</span>
                </div>
                <div className="step">
                  <span>Scoring each option</span>
                  <span className="tag">02</span>
                </div>
                <div className="step">
                  <span>Detecting trade-offs</span>
                  <span className="tag">03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">What DIA delivers</h2>
          <p className="section-subtitle">
            A multi-layered analysis that feels like a strategic briefing,
            not a spreadsheet.
          </p>
          <div className="grid">
            <div className="card">
              <h3>Criteria intelligence</h3>
              <p>
                DIA determines the right criteria for your decision and scores
                each option on a 1-10 scale.
              </p>
            </div>
            <div className="card">
              <h3>Trade-off lens</h3>
              <p>
                See what each option gains and loses with explicit trade-off
                callouts.
              </p>
            </div>
            <div className="card">
              <h3>Risk dashboard</h3>
              <p>
                Risk levels, scores, and drivers are surfaced for every option.
              </p>
            </div>
            <div className="card">
              <h3>Outcome simulation</h3>
              <p>
                Best, average, and worst case outcomes are generated for each
                path.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer container">
        Built for decisions that deserve more than a gut feeling.
      </footer>
    </div>
  );
}
