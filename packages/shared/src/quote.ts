import { Interface, getAddress } from 'ethers';
import { minimumOut } from './money.js';

export function v2AmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) {
    throw new Error('Reserves and input must be positive.');
  }
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

export function spotEthValue(tokenRaw: bigint, reserveToken: bigint, reserveEth: bigint): bigint {
  if (tokenRaw < 0n || reserveToken <= 0n || reserveEth <= 0n) return 0n;
  return (tokenRaw * reserveEth) / reserveToken;
}

export interface PreparedCall {
  to: string;
  data: string;
  value: bigint;
  chainId: number;
}

export function buildV2SwapEthForTokens(args: {
  chainId: number;
  router: string;
  amountInWei: bigint;
  quotedOut: bigint;
  slippagePercent: string;
  path: [string, string];
  recipient: string;
  deadlineUnix: number;
}): PreparedCall {
  const minOut = minimumOut(args.quotedOut, args.slippagePercent);
  const iface = new Interface([
    'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  ]);
  const data = iface.encodeFunctionData('swapExactETHForTokens', [
    minOut,
    [getAddress(args.path[0]), getAddress(args.path[1])],
    getAddress(args.recipient),
    args.deadlineUnix,
  ]);
  return {
    to: getAddress(args.router),
    data,
    value: args.amountInWei,
    chainId: args.chainId,
  };
}
