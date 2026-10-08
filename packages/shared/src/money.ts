export function parseDecimalToScale(value: string, scale = 18): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, fraction = ''] = trimmed.split('.');
  if (whole === undefined || fraction.length > scale) return null;
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, '0'));
}

export function compareDecimals(left: string, right: string, scale = 18): number | null {
  const a = parseDecimalToScale(left, scale);
  const b = parseDecimalToScale(right, scale);
  if (a === null || b === null) return null;
  return a < b ? -1 : a > b ? 1 : 0;
}

export type OrderAmount =
  | { ok: true; wei: bigint }
  | { ok: false; code: 'range' | 'invalid'; message: string };

export function parseOrderAmount(input: string): OrderAmount {
  const trimmed = input.trim();
  if (trimmed.includes('%') || trimmed.includes('-')) {
    return {
      ok: false,
      code: 'range',
      message: 'Percentage and range amounts are not enabled. Nothing was submitted.',
    };
  }
  const wei = parseDecimalToScale(trimmed, 18);
  if (wei === null || wei <= 0n) {
    return {
      ok: false,
      code: 'invalid',
      message: 'Enter a positive ETH amount. Nothing was submitted.',
    };
  }
  return { ok: true, wei };
}

export function slippageHundredths(percent: string): number {
  const trimmed = percent.trim();
  const match = /^(\d+)(?:\.(\d{1,4}))?$/.exec(trimmed);
  if (!match) throw new Error('Enter slippage as a percent, such as 0.05.');
  const whole = Number(match[1]);
  const fraction = (match[2] ?? '').padEnd(2, '0').slice(0, 2);
  const hundredths = whole * 100 + Number(fraction);
  if (!Number.isSafeInteger(hundredths)) throw new Error('Slippage is too large.');
  return hundredths;
}

export function assertOrderSlippage(percent: string): number {
  const hundredths = slippageHundredths(percent);
  if (hundredths >= 10_000) {
    throw new Error('100% slippage is display-only and cannot be used for an order.');
  }
  if (hundredths > 5_000) {
    throw new Error('Slippage above 50% is not allowed.');
  }
  return hundredths;
}

export function minimumOut(amountOut: bigint, slippagePercent: string): bigint {
  const hundredths = assertOrderSlippage(slippagePercent);
  const kept = 10_000n - BigInt(hundredths);
  return (amountOut * kept) / 10_000n;
}
