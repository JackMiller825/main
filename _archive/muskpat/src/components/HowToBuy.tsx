import { ArrowLeftRight, ShieldAlert, Wallet } from "lucide-react";
import { chartUrl, tokenConfig } from "../config/token";
import { ContractCopyButton } from "./ContractBar";
import { GlowButton } from "./GlowButton";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { asset } from "../config/assets";

const steps = [
  {
    n: "01",
    title: "GET A WALLET",
    text: "Install an Ethereum-compatible wallet.",
    icon: <Wallet aria-hidden="true" />,
  },
  {
    n: "02",
    title: "GET ETH",
    text: "Add ETH to your wallet for your purchase and network fees.",
    icon: <img src={asset("images/muskpat-icon-eth.png")} alt="" width="36" height="36" />,
  },
  {
    n: "03",
    title: "OPEN UNISWAP",
    text: "Open the official swap link and verify the $MUSKPAT contract address.",
    icon: <ArrowLeftRight aria-hidden="true" />,
  },
  {
    n: "04",
    title: "SWAP",
    text: "Enter the amount of ETH you want to swap and confirm the transaction.",
    icon: <img src={asset("images/muskpat-icon-rocket.png")} alt="" width="36" height="36" />,
  },
];

export function HowToBuy() {
  const buy = tokenConfig.uniswapUrl.trim();
  const chart = chartUrl();

  return (
    <section className="section buy" id="how-to-buy" aria-labelledby="buy-title">
      <img className="float-sticker sticker-optional buy-point" src={asset("images/muskpat-sticker-elon-point.png")} alt="" width="96" height="100" />
      <div className="wrap">
        <div className="split">
          <SectionHeading
            eyebrow="ETHEREUM"
            title={<span id="buy-title">HOW TO BUY {tokenConfig.ticker}</span>}
            subtitle="Four steps to join the mission."
          />
          <figure className="monitor">
            <figcaption>SWAP SEQUENCE</figcaption>
            <img
              src={asset("images/muskpat-section-how-to-buy.png")}
              alt="Artwork showing simple steps to swap for $MUSKPAT"
              width="244"
              height="172"
              loading="lazy"
            />
          </figure>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <Reveal key={step.n} className="panel bracket step-card" delay={index * 0.05}>
              <div className="step-icon">{step.icon}</div>
              <p className="pattern-step">STEP {step.n}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="warning" role="note">
          <ShieldAlert aria-hidden="true" />
          <p>
            <strong>Security check. </strong>
            Always verify the official contract address shown on this website before swapping.
          </p>
        </div>
        <div className="buy-actions">
          <GlowButton href={buy} variant="primary" showArrow disabled={!buy} title={buy ? "Buy $MUSKPAT" : "Swap link coming soon"}>
            BUY {tokenConfig.ticker}
          </GlowButton>
          <ContractCopyButton idleLabel="COPY CONTRACT" />
          <GlowButton href={chart} variant="ghost" showArrow disabled={!chart} title={chart ? "View chart" : "Chart link coming soon"}>
            VIEW CHART
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
