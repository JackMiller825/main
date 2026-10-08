import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

const phases = [
  {
    id: "01",
    name: "EARTH",
    status: "MISSION START",
    current: true,
    icon: asset("images/muskpat-icon-earth.png"),
    alt: "Earth",
    items: ["Project launch", "Website launch", "Community launch", "Social channels", "Initial meme campaign"],
  },
  {
    id: "02",
    name: "MOON",
    status: "NEXT ORBIT",
    current: false,
    icon: asset("images/muskpat-icon-moon.png"),
    alt: "Moon",
    items: ["Community expansion", "Meme campaigns", "Ecosystem visibility", "Trading analytics integrations", "Community events"],
  },
  {
    id: "03",
    name: "MARS",
    status: "MARS APPROACH",
    current: false,
    icon: asset("images/muskpat-icon-mars.png"),
    alt: "Mars",
    items: ["Ecosystem expansion", "Community tools", "More creative campaigns", "Additional integrations", "International community growth"],
  },
  {
    id: "04",
    name: "BEYOND",
    status: "∞",
    current: false,
    icon: asset("images/muskpat-icon-rocket.png"),
    alt: "Rocket",
    items: [
      "Long-term community initiatives",
      "New ecosystem experiments",
      "Additional utilities if community supports them",
      "Continue the mission",
    ],
  },
];

export function Roadmap() {
  return (
    <section className="section roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="wrap">
        <div className="split roadmap-head">
          <SectionHeading
            eyebrow="EARTH → MOON → MARS → ∞"
            title={<span id="roadmap-title">MISSION ROADMAP</span>}
            subtitle="From Pattern to Mars."
          />
          <figure className="monitor">
            <figcaption>TRAJECTORY</figcaption>
            <img
              src={asset("images/muskpat-section-roadmap.png")}
              alt="Artwork of a route from Earth toward Mars"
              width="255"
              height="172"
              loading="lazy"
            />
          </figure>
        </div>
        <div className="roadmap-track">
          {phases.map((phase, index) => (
            <Reveal key={phase.id} className={phase.current ? "phase is-current" : "phase"} delay={index * 0.05}>
                <div className="phase-node">
                  <img src={phase.icon} alt="" width="36" height="36" />
                </div>
                <p className="phase-id">PHASE {phase.id}</p>
                <h3>{phase.name}</h3>
                <ul>
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="phase-status">
                  <span>Status</span>
                  {phase.status}
                </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
