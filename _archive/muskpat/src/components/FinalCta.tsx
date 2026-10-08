import { useEffect, useRef, useState } from "react";
import { communityUrl } from "../config/socials";
import { tokenConfig } from "../config/token";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { GlowButton } from "./GlowButton";
import { asset } from "../config/assets";

export function FinalCta() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [rising, setRising] = useState(false);
  const join = communityUrl();
  const buy = tokenConfig.uniswapUrl.trim();

  useEffect(() => {
    if (reduced) {
      setRising(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRising(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section className={rising ? "final-cta is-rising" : "final-cta"} ref={ref} aria-labelledby="final-title">
      <div className="final-bg" />
      <div className="hero-shade" />
      <div className="wrap final-grid">
        <div>
          <p className="eyebrow">TO INFINITY AND HIGHER</p>
          <h2 id="final-title">
            THE PATTERN HAS BEEN FOUND.
            <span>WHERE DOES IT GO NEXT?</span>
          </h2>
          <p className="ticker">{tokenConfig.ticker}</p>
          <div className="final-actions">
            <GlowButton href={join} variant="ghost" showArrow disabled={!join} title={join ? "Join community" : "Community link coming soon"}>
              JOIN COMMUNITY
            </GlowButton>
            <GlowButton href={buy} variant="primary" showArrow disabled={!buy} title={buy ? "Buy $MUSKPAT" : "Swap link coming soon"}>
              BUY {tokenConfig.ticker}
            </GlowButton>
          </div>
        </div>
        <div className="final-stage">
          <img className="final-banner" src={asset("images/muskpat-banner-1100x520.png")} alt="" width="615" height="182" loading="lazy" />
          <img className="final-rocket" src={asset("images/muskpat-sticker-rocket.png")} alt="" width="140" height="140" />
          <img className="final-smile sticker-optional" src={asset("images/muskpat-sticker-elon-smile.png")} alt="" width="96" height="104" />
        </div>
      </div>
    </section>
  );
}
