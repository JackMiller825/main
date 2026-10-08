import { communityUrl } from "../config/socials";
import { tokenConfig } from "../config/token";
import { FloatingChart } from "./FloatingChart";
import { GlowButton } from "./GlowButton";
import { asset } from "../config/assets";

const points = [
  { kicker: "BIG IDEAS", text: "BIGGER CANDLES" },
  { kicker: "GLOBAL COMMUNITY", text: "ONE MISSION" },
  { kicker: "EARTH → MOON → MARS", text: "AND BEYOND" },
];

export function Hero() {
  const join = communityUrl();
  const buy = tokenConfig.uniswapUrl.trim();

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-bg" />
      <div className="stars" />
      <div className="grid-overlay" />
      <div className="hero-candles" />
      <div className="hero-shade" />

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="status-dot" aria-hidden="true" />
            NEXT STOP: MARS
          </p>
          <h1 className="hero-title" id="hero-title">
            <span className="line-musk">MUSK</span>
            <span className="line-rest">MOONSHOT PATTERN</span>
          </h1>
          <p className="ticker">{tokenConfig.ticker}</p>
          <p className="slogan">
            <span>SAME PATTERN.</span>
            <span>HIGHER PRICE.</span>
          </p>
          <p className="lede">
            $MUSKPAT is a community-powered Ethereum meme token built around one simple idea: when ambition gets bigger, the pattern gets bigger.
          </p>
          <div className="hero-actions">
            <GlowButton
              href={buy}
              artSrc={asset("images/muskpat-button-buy.png")}
              variant="primary"
              disabled={!buy}
              title={buy ? "Buy $MUSKPAT" : "Swap link coming soon"}
            >
              BUY {tokenConfig.ticker}
            </GlowButton>
            <GlowButton
              href={join}
              artSrc={asset("images/muskpat-button-community.png")}
              variant="ghost"
              disabled={!join}
              title={join ? "Join community" : "Community link coming soon"}
            >
              JOIN COMMUNITY
            </GlowButton>
          </div>
          {!buy || !join ? (
            <p className="pending-links">
              {!buy ? "Swap link coming soon." : null} {!join ? "Community link coming soon." : null}
            </p>
          ) : null}
          <ul className="value-points">
            {points.map((point) => (
              <li key={point.kicker}>
                <strong>{point.kicker}</strong>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-stage">
          <div className="ignition" />
          <div className="reticle" />
          <img className="planet earth" src={asset("images/muskpat-icon-earth.png")} alt="" width="86" height="86" />
          <img className="planet mars" src={asset("images/muskpat-icon-mars.png")} alt="" width="108" height="108" />
          <FloatingChart />
          <img
            className="hero-character"
            src={asset("images/muskpat-hero-character-transparent.png")}
            alt="Stylized astronaut character artwork for $MUSKPAT"
            width="245"
            height="240"
            fetchPriority="high"
          />
          <img className="hero-sticker chart-sticker" src={asset("images/muskpat-sticker-chart-up.png")} alt="" width="120" height="104" />
          <p className="stage-readout">
            <span>MISSION ACTIVE</span>
            <span>PATTERN DETECTED</span>
          </p>
        </div>
      </div>
    </section>
  );
}
