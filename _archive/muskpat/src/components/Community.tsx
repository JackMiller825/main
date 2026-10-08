import { tokenConfig } from "../config/token";
import { socialLinks } from "../config/socials";
import { GlowButton } from "./GlowButton";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

export function Community() {
  const telegram = socialLinks.telegram.trim();
  const x = socialLinks.x.trim();
  const dexscreener = tokenConfig.dexscreenerUrl.trim();
  const dextools = tokenConfig.dextoolsUrl.trim();
  const channelsReady = Boolean(telegram || x || dexscreener || dextools);

  return (
    <section className="section community" id="community" aria-labelledby="community-title">
      <div className="community-bg" />
      <div className="hero-shade" />
      <img className="float-sticker doge-cool" src={asset("images/muskpat-sticker-doge-cool.png")} alt="" width="110" height="120" />
      <img className="float-sticker doge-happy sticker-optional" src={asset("images/muskpat-sticker-doge-happy.png")} alt="" width="110" height="120" />
      <img className="float-sticker to-moon sticker-optional" src={asset("images/muskpat-sticker-to-the-moon.png")} alt="" width="110" height="112" />
      <div className="wrap">
        <SectionHeading
          id="community-title"
          eyebrow="MISSION CONTROL"
          align="center"
          title="JOIN THE MISSION"
          subtitle="SAME PATTERN. BIGGER COMMUNITY."
        />
        <Reveal>
          <figure className="monitor monitor-wide">
            <figcaption>BROADCAST</figcaption>
            <img
              src={asset("images/muskpat-banner-3to1.png")}
              alt="MUSK MOONSHOT PATTERN banner"
              width="680"
              height="222"
              loading="lazy"
            />
          </figure>
        </Reveal>
        <div className="community-grid">
          <Reveal className="panel bracket cta-card">
            <img src={asset("images/muskpat-icon-doge.png")} alt="" width="64" height="64" />
            <h3>TELEGRAM</h3>
            <p>Enter mission control.</p>
            <GlowButton href={telegram} variant="primary" showArrow disabled={!telegram} title={telegram ? "Telegram" : "Telegram coming soon"}>
              {telegram ? "ENTER" : "COMING SOON"}
            </GlowButton>
          </Reveal>
          <Reveal className="panel bracket cta-card" delay={0.06}>
            <img src={asset("images/muskpat-icon-rocket.png")} alt="" width="64" height="64" />
            <h3>X</h3>
            <p>Follow the pattern.</p>
            <GlowButton href={x} variant="ghost" showArrow disabled={!x} title={x ? "X" : "X coming soon"}>
              {x ? "FOLLOW" : "COMING SOON"}
            </GlowButton>
          </Reveal>
          <Reveal className="panel bracket cta-card" delay={0.12}>
            <img src={asset("images/muskpat-icon-chart.png")} alt="" width="64" height="64" />
            <h3>DEXTOOLS / DEXSCREENER</h3>
            <p>Watch the chart.</p>
            <div className="stack-actions">
              {dexscreener ? (
                <GlowButton href={dexscreener} variant="ghost" showArrow>
                  DEXSCREENER
                </GlowButton>
              ) : null}
              {dextools ? (
                <GlowButton href={dextools} variant="ghost" showArrow>
                  DEXTOOLS
                </GlowButton>
              ) : null}
              {!dexscreener && !dextools ? (
                <GlowButton variant="ghost" disabled title="Chart link coming soon">
                  COMING SOON
                </GlowButton>
              ) : null}
            </div>
          </Reveal>
        </div>
        <figure className="monitor monitor-wide community-still">
          <figcaption>CREW</figcaption>
          <img
            src={asset("images/muskpat-section-community.png")}
            alt="Community artwork of supporters and shiba astronauts"
            width="257"
            height="172"
            loading="lazy"
          />
        </figure>
        {!channelsReady ? (
          <p className="fine center">Channel and chart links will appear here when they are published.</p>
        ) : null}
      </div>
      <img className="float-sticker group-float sticker-optional" src={asset("images/muskpat-sticker-group.png")} alt="" width="280" height="106" />
    </section>
  );
}
