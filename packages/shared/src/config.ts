import { compareDecimals, parseDecimalToScale } from './money.js';

export interface EngineConfigInput {
  poolMin: string;
  poolMax: string;
  buyMin: string;
  buyMax: string;
  buyCountMin: string;
  buyCountMax: string;
  sellCountMin: string;
  sellCountMax: string;
  disperseMin: string;
  disperseMax: string;
  buyIntervalMin: string;
  buyIntervalMax: string;
  sellIntervalMin: string;
  sellIntervalMax: string;
  buySlippage: string;
  engineTip: string;
  maxHold: string;
}

function range(errors: string[], label: string, min: string, max: string, scale: number): void {
  const compared = compareDecimals(min, max, scale);
  if (compared === null) errors.push(`${label} needs a decimal minimum and maximum.`);
  else if (compared > 0) errors.push(`${label} minimum must be less than or equal to the maximum.`);
}

export function validateEngineConfig(input: EngineConfigInput): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  range(errors, 'Pool size', input.poolMin, input.poolMax, 18);
  range(errors, 'Buy amount', input.buyMin, input.buyMax, 18);
  range(errors, 'Buy account count', input.buyCountMin, input.buyCountMax, 0);
  range(errors, 'Sell account count', input.sellCountMin, input.sellCountMax, 0);
  range(errors, 'Disperse amount', input.disperseMin, input.disperseMax, 18);
  range(errors, 'Buy interval', input.buyIntervalMin, input.buyIntervalMax, 0);
  range(errors, 'Sell interval', input.sellIntervalMin, input.sellIntervalMax, 0);
  if (parseDecimalToScale(input.buySlippage, 4) === null) errors.push('Buy slippage must be a decimal percent.');
  if (parseDecimalToScale(input.engineTip, 9) === null) errors.push('Engine tip must be a non-negative gwei amount.');
  const hold = parseDecimalToScale(input.maxHold, 4);
  if (hold === null || hold <= 0n) errors.push('Max hold must be a positive percent.');
  return errors.length ? { ok: false, errors } : { ok: true };
}
