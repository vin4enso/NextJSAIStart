import type { ReactNode } from "react";

interface SectionBlockProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function SectionBlock({ title, subtitle, children }: SectionBlockProps) {
  return (
    <section>
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </section>
  );
}
