import { asset } from "../config/assets";
type RocketDividerProps = {
  label: string;
};

export function RocketDivider({ label }: RocketDividerProps) {
  return (
    <div className="rocket-divider" aria-hidden="true">
      <div className="rocket-divider-track">
        <span className="mini-candle" />
        <span className="mini-candle down" />
        <span className="mini-candle tall" />
        <img src={asset("images/muskpat-icon-rocket.png")} alt="" width="28" height="28" />
        <span className="mini-candle tall" />
        <span className="mini-candle" />
        <span className="divider-label">{label}</span>
      </div>
    </div>
  );
}
