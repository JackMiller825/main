import { displayOrTba, tokenConfig } from "../config/token";
import { ContractCopyButton } from "./ContractBar";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

const fields = [
  { label: "TOKEN", value: tokenConfig.ticker },
  { label: "CHAIN", value: tokenConfig.chain.toUpperCase() },
  { label: "TOTAL SUPPLY", value: displayOrTba(tokenConfig.totalSupply) },
  { label: "BUY TAX", value: displayOrTba(tokenConfig.buyTax) },
  { label: "SELL TAX", value: displayOrTba(tokenConfig.sellTax) },
];

export function Tokenomics() {
  return (
    <section className="section tokenomics" id="tokenomics" aria-labelledby="tokenomics-title">
      <div className="wrap">
        <div className="split">
          <div>
            <SectionHeading id="tokenomics-title" eyebrow="ETHEREUM" title="TOKENOMICS" subtitle="Mission parameters." />
            <Reveal>
              <dl className="stat-grid">
                {fields.map((field) => (
                  <div key={field.label} className="panel">
                    <dt>{field.label}</dt>
                    <dd className={field.label === "TOKEN" ? "glow-text" : undefined}>{field.value}</dd>
                  </div>
                ))}
                <div className="panel contract-cell">
                  <dt>CONTRACT</dt>
                  <dd>{displayOrTba(tokenConfig.contractAddress)}</dd>
                  <ContractCopyButton />
                </div>
              </dl>
              <p className="fine">Allocation percentages are unpublished. No supply, tax, or liquidity figure is shown until it is added to the project config.</p>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <figure className="monitor mission-visual">
              <figcaption>PARAMETERS // TBA</figcaption>
              <img
                src={asset("images/muskpat-section-tokenomics.png")}
                alt=""
                width="228"
                height="172"
                loading="lazy"
              />
              <div className="tba-plate">
                <img src={asset("images/muskpat-icon-eth.png")} alt="" width="48" height="48" />
                <strong>ALLOCATION TBA</strong>
                <span>Mission visual until real tokenomics are published.</span>
              </div>
            </figure>
            <ul className="orbit-icons" aria-hidden="true">
              <li><img src={asset("images/muskpat-icon-earth.png")} alt="" width="56" height="56" /></li>
              <li><img src={asset("images/muskpat-icon-moon.png")} alt="" width="56" height="56" /></li>
              <li><img src={asset("images/muskpat-icon-mars.png")} alt="" width="56" height="56" /></li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
