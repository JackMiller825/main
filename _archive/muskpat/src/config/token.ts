/**
 * Public token settings.
 * Leave a string empty until the value is real.
 * Empty fields render as TBA, and related buttons stay disabled.
 * Do not fill these with estimates.
 */
export const tokenConfig = {
  name: "MUSK MOONSHOT PATTERN",
  ticker: "$MUSKPAT",
  chain: "Ethereum",
  network: "Ethereum",
  contractAddress: "",
  totalSupply: "",
  buyTax: "",
  sellTax: "",
  liquidity: "",
  uniswapUrl: "",
  dextoolsUrl: "",
  dexscreenerUrl: "",
} as const;

export function isSet(value: string): boolean {
  return value.trim().length > 0;
}

export function displayOrTba(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "TBA";
}

export function chartUrl(): string {
  return tokenConfig.dexscreenerUrl.trim() || tokenConfig.dextoolsUrl.trim();
}
