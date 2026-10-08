type PatternCardProps = {
  step: string;
  title: string;
  label: string;
  icon: string;
  iconAlt: string;
};

export function PatternCard({ step, title, label, icon, iconAlt }: PatternCardProps) {
  return (
    <article className="pattern-card">
      <div className="pattern-icon">
        <img src={icon} alt={iconAlt} width={72} height={72} />
      </div>
      <p className="pattern-step">{step}</p>
      <h3>{title}</h3>
      <p className="pattern-label">{label}</p>
    </article>
  );
}
