import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({ id, eyebrow, title, subtitle, align = "left" }: SectionHeadingProps) {
  return (
    <header className={`section-heading align-${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      {subtitle ? <p className="section-sub">{subtitle}</p> : null}
    </header>
  );
}
