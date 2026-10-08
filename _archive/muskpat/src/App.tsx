import { About } from "./components/About";
import { Community } from "./components/Community";
import { ContractBar } from "./components/ContractBar";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowToBuy } from "./components/HowToBuy";
import { Navbar } from "./components/Navbar";
import { PatternThesis } from "./components/PatternThesis";
import { Roadmap } from "./components/Roadmap";
import { RocketDivider } from "./components/RocketDivider";
import { Tokenomics } from "./components/Tokenomics";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <RocketDivider label="EARTH → MOON → MARS → ∞" />
        <About />
        <PatternThesis />
        <RocketDivider label="HIGHER THAN EARTH" />
        <Tokenomics />
        <ContractBar />
        <Roadmap />
        <RocketDivider label="TO INFINITY AND HIGHER" />
        <HowToBuy />
        <Community />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
