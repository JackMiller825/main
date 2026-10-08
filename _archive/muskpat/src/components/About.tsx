import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

const cards = [
  { n: "01", title: "MOONSHOT MINDSET", text: "Think beyond normal limits." },
  { n: "02", title: "COMMUNITY DRIVEN", text: "Built around memes, creativity and participation." },
  { n: "03", title: "CHART PATTERN ENERGY", text: "Trading culture transformed into a visual language." },
];

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="split">
          <Reveal>
            <SectionHeading
              id="about-title"
              eyebrow="FROM EARTH TO MARS AND BEYOND"
              title={
                <>
                  WHAT IS <span className="glow-text">$MUSKPAT</span>?
                </>
              }
              subtitle="Same vision. Bigger candles."
            />
            <div className="prose">
              <p>$MUSKPAT turns the moonshot mindset into a meme-driven Ethereum community.</p>
              <p>
                It combines space exploration, trading-chart culture, internet memes, and the idea of thinking far beyond conventional limits.
              </p>
              <p className="trajectory-copy">
                Earth is the starting point.
                <br />
                The Moon is the checkpoint.
                <br />
                Mars is only the next stop.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <figure className="monitor">
              <figcaption>ABOUT // SIGNAL</figcaption>
              <img
                src={asset("images/muskpat-section-about.png")}
                alt="Artwork introducing the $MUSKPAT community story"
                width="244"
                height="172"
                loading="lazy"
              />
              <img className="monitor-sticker" src={asset("images/muskpat-sticker-doge-rocket.png")} alt="" width="90" height="78" />
            </figure>
          </Reveal>
        </div>
        <div className="about-cards">
          {cards.map((card, index) => (
            <Reveal key={card.n} className="panel bracket about-card" delay={index * 0.06}>
              <span>{card.n}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
