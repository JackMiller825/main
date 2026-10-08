import { displayOrTba, tokenConfig } from "../config/token";
import { useClipboard } from "../hooks/useClipboard";
import { asset } from "../config/assets";

export function ContractCopyButton({ idleLabel = "COPY" }: { idleLabel?: string }) {
  const { available, copied, copy } = useClipboard(tokenConfig.contractAddress);
  const label = !available ? "COMING SOON" : copied ? "COPIED" : idleLabel;

  return (
    <button type="button" className="glow-btn glow-btn--ghost" onClick={copy} disabled={!available} aria-live="polite">
      <span>{label}</span>
    </button>
  );
}

export function ContractBar() {
  const address = displayOrTba(tokenConfig.contractAddress);

  return (
    <section className="contract-bar" aria-label="Contract address">
      <div className="wrap contract-bar-inner">
        <img src={asset("images/muskpat-logo-icon-transparent.png")} alt="" width="36" height="34" />
        <div>
          <p className="eyebrow">CONTRACT</p>
          <p className="contract-value" title={tokenConfig.contractAddress.trim() || "TBA"}>
            {address}
          </p>
        </div>
        <p className="contract-meta">
          {tokenConfig.chain.toUpperCase()} · {tokenConfig.ticker} · {tokenConfig.contractAddress.trim() ? "PUBLISHED" : "NOT PUBLISHED"}
        </p>
        <ContractCopyButton />
      </div>
    </section>
  );
}
