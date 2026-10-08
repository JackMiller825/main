import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PatternCard } from "./PatternCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

const cards = [
  { step: "01", title: "EARTH PATTERN", label: "BUILD", icon: asset("images/muskpat-icon-earth.png"), iconAlt: "Earth" },
  { step: "02", title: "MOON PATTERN", label: "BREAKOUT", icon: asset("images/muskpat-icon-moon.png"), iconAlt: "Moon" },
  { step: "03", title: "MARS PATTERN", label: "EXPANSION", icon: asset("images/muskpat-icon-mars.png"), iconAlt: "Mars" },
  { step: "04", title: "ROCKET PATTERN", label: "ACCELERATION", icon: asset("images/muskpat-icon-rocket.png"), iconAlt: "Rocket" },
  { step: "05", title: "CHART PATTERN", label: "HIGHER", icon: asset("images/muskpat-icon-chart.png"), iconAlt: "Candlestick chart" },
];

const rows = [
  ["MOONSHOT MINDSET", "ONLINE"],
  ["COMMUNITY SIGNAL", "ACTIVE"],
  ["MEME ENERGY", "HIGH"],
  ["MISSION DESTINATION", "MARS"],
  ["PATTERN", "↑"],
  ["NEXT STOP", "BEYOND"],
];

export function PatternThesis() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduced) {
      setLive(true);
      return;
    }
    const node = trackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section className="section pattern" id="pattern" aria-labelledby="pattern-title">
      <div className="wrap">
        <div className="split pattern-intro">
          <SectionHeading
            id="pattern-title"
            eyebrow="PATTERN DETECTED"
            title={
              <>
                THE MUSK
                <br />
                MOONSHOT PATTERN
              </>
            }
            subtitle={
              <>
                SAME PATTERN.
                <br />
                HIGHER PRICE.
              </>
            }
          />
          <figure className="monitor">
            <figcaption>VISION // HIGHER</figcaption>
            <img
              src={asset("images/muskpat-section-vision.png")}
              alt="Artwork with the line Same pattern. Higher price."
              width="245"
              height="172"
              loading="lazy"
            />
          </figure>
        </div>

        <div className={live ? "pattern-track is-live" : "pattern-track"} ref={trackRef}>
          <div className="pattern-line" aria-hidden="true">
            <span />
          </div>
          {cards.map((card) => (
            <PatternCard key={card.step} {...card} />
          ))}
        </div>
        <p className="path-legend">EARTH → MOON → MARS → BEYOND → ∞</p>

        <Reveal>
          <div className="terminal" role="region" aria-label="Decorative pattern engine. Not live market data.">
            <header className="terminal-head">
              <span>MUSKPAT PATTERN ENGINE</span>
              <span>VISUAL ONLY</span>
            </header>
            <dl>
              {rows.map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>
                    {value}
                    {name === "NEXT STOP" ? <i className="cursor" aria-hidden="true" /> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="motif-row" aria-hidden="true">
              <img src={asset("images/muskpat-icon-doge.png")} alt="" width="42" height="42" />
              <img src={asset("images/muskpat-icon-chart.png")} alt="" width="42" height="42" />
              <img src={asset("images/muskpat-icon-eth.png")} alt="" width="42" height="42" />
              <img src={asset("images/muskpat-icon-tesla.png")} alt="" width="42" height="42" />
              <img src={asset("images/muskpat-icon-spacex.png")} alt="" width="42" height="42" />
            </div>
            <p className="terminal-note">Artwork motifs only. Not affiliations, listings, or market data.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
