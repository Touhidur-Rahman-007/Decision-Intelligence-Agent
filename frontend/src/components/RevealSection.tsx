import { ReactNode } from 'react';

export function RevealSection({
  title,
  index,
  activeIndex,
  children,
}: {
  title: string;
  index: number;
  activeIndex: number;
  children: ReactNode;
}) {
  const isVisible = index <= activeIndex;

  return (
    <section
      className={`section-card ${isVisible ? 'reveal' : ''}`}
      style={{ opacity: isVisible ? 1 : 0, marginBottom: 24 }}
    >
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {children}
    </section>
  );
}
