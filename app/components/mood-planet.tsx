type MoodPlanetProps = {
  score: number;
  label: string;
  glow?: "purple" | "cyan";
  size?: "sm" | "md" | "lg";
};

export function MoodPlanet({ score, label, glow = "purple", size = "md" }: MoodPlanetProps) {
  return (
    <article className="mv-card mv-planet-card">
      <div className={`mv-planet-shell ${size}`}>
        <div className={`mv-planet ${glow}`}>
          <span>{label}</span>
        </div>
      </div>
      <div className="mv-planet-score">
        <strong>{score}%</strong>
        <span>对齐指数</span>
      </div>
    </article>
  );
}
