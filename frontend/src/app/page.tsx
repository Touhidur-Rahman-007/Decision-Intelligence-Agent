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
              <Link className="button primary" href="/auth/login">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
