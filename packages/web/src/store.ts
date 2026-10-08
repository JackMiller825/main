import {
  blockedControlMessage,
  parseDashboardQuery,
  renderTemplate,
  screenshotFixture,
  type CompilationArtifact,
  type TemplateKind,
} from '@launchpad/shared';
import { create } from 'zustand';
import { appMode } from './config';

export interface WatchAccount {
  id: string;
  name: string;
  address: string;
  kind: 'watch';
}

export interface DialogLink {
  href: string;
  label: string;
}

interface DialogState {
  title: string;
  body: string;
  links?: DialogLink[];
}

const query = parseDashboardQuery(typeof window === 'undefined' ? '' : window.location.search);
const fixtureSession = appMode === 'demo' && query.fixtureSession;
const shot = screenshotFixture;
const fixtureSource = renderTemplate('trending', { name: shot.launch.name, symbol: shot.launch.symbol });
const blankSource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Enter a name and symbol, then load a reviewed template.
`;

export interface DashboardState {
  fixtureSession: boolean;
  capture: boolean;
  auth: 'disconnected' | 'connecting' | 'signing' | 'retry' | 'denied' | 'ready';
  gateDetail: string;
  address: string | null;
  role: 'owner' | 'operator' | null;
  leftTab: 'launch' | 'config' | 'wallet';
  launchView: 'trading' | 'editor';
  tradingTab: 'manual' | 'engine';
  scroll: 'top' | 'advanced';
  holdMin: string;
  holdMax: string;
  accountCount: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  poolEth: string;
  poolTokenPercent: string;
  launchFunction: string;
  bundleTip: string;
  buyRoute: string;
  removeLimits: boolean;
  renounce: boolean;
  verifyAfter: boolean;
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
  configSlippage: string;
  engineTip: string;
  maxHold: string;
  pattern: 'CAH' | 'FW' | 'AT' | 'Mix' | '';
  buyBundle: boolean;
  sellBundle: boolean;
  autoStart: boolean;
  devSellPercent: string;
  sell1: string;
  sell2: string;
  sell3: string;
  configRevision: number;
  walletsCount: string;
  includeRemoved: boolean;
  showAddresses: boolean;
  fundAmount: string;
  tokenSearch: string;
  countBox: string;
  buyRange: string;
  bundle: boolean;
  sellPercent: string;
  minBuy: string;
  minSell: string;
  slipBuy: string;
  slipSell: string;
  tip: string;
  autoSell: string;
  autoBuy: string;
  stopLoss: string;
  profitTarget: string;
  template: TemplateKind;
  source: string;
  generatedSource: string;
  artifact: CompilationArtifact | null;
  diagnostics: string[];
  selectedContract: string;
  compiling: boolean;
  saved: boolean;
  accounts: WatchAccount[];
  watchlist: string[];
  watchRunning: boolean;
  dialog: DialogState | null;
  toast: string;
  patch: (values: Partial<DashboardState>) => void;
  showDialog: (title: string, body: string, links?: DialogLink[]) => void;
  closeDialog: () => void;
  explain: (control: string) => void;
  setIdentity: (name: string, symbol: string) => void;
  setTemplate: (template: TemplateKind) => void;
  setSource: (source: string) => void;
  addAccounts: (records: Array<{ name: string; address: string }>) => void;
  logout: () => void;
}

export const useDashboard = create<DashboardState>((set, get) => ({
  fixtureSession,
  capture: appMode === 'demo' && query.capture,
  auth: fixtureSession ? 'ready' : 'disconnected',
  gateDetail: '',
  address: null,
  role: fixtureSession ? 'owner' : null,
  leftTab: query.fixture === 'config' ? 'config' : query.fixture === 'wallet' ? 'wallet' : 'launch',
  launchView: query.fixture === 'editor' ? 'editor' : 'trading',
  tradingTab: 'manual',
  scroll: query.scroll,
  holdMin: fixtureSession ? shot.launch.holdMin : '',
  holdMax: fixtureSession ? shot.launch.holdMax : '',
  accountCount: fixtureSession ? shot.launch.accountCount : '',
  tokenAddress: '',
  name: fixtureSession ? shot.launch.name : '',
  symbol: fixtureSession ? shot.launch.symbol : '',
  poolEth: fixtureSession ? shot.launch.poolEth : '',
  poolTokenPercent: fixtureSession ? shot.launch.poolTokenPercent : '',
  launchFunction: fixtureSession ? shot.launch.launchFunction : '',
  bundleTip: fixtureSession ? shot.launch.bundleTip : '',
  buyRoute: 'v2',
  removeLimits: fixtureSession ? shot.launch.removeLimits : false,
  renounce: fixtureSession ? shot.launch.renounce : false,
  verifyAfter: fixtureSession ? shot.launch.verify : false,
  poolMin: fixtureSession ? shot.config.poolMin : '',
  poolMax: fixtureSession ? shot.config.poolMax : '',
  buyMin: fixtureSession ? shot.config.buyMin : '',
  buyMax: fixtureSession ? shot.config.buyMax : '',
  buyCountMin: fixtureSession ? shot.config.buyCountMin : '',
  buyCountMax: fixtureSession ? shot.config.buyCountMax : '',
  sellCountMin: fixtureSession ? shot.config.sellCountMin : '',
  sellCountMax: fixtureSession ? shot.config.sellCountMax : '',
  disperseMin: fixtureSession ? shot.config.disperseMin : '',
  disperseMax: fixtureSession ? shot.config.disperseMax : '',
  buyIntervalMin: fixtureSession ? shot.config.buyIntervalMin : '',
  buyIntervalMax: fixtureSession ? shot.config.buyIntervalMax : '',
  sellIntervalMin: fixtureSession ? shot.config.sellIntervalMin : '',
  sellIntervalMax: fixtureSession ? shot.config.sellIntervalMax : '',
  configSlippage: fixtureSession ? shot.config.buySlippage : '',
  engineTip: fixtureSession ? shot.config.engineTip : '',
  maxHold: fixtureSession ? shot.config.maxHold : '',
  pattern: fixtureSession ? shot.config.pattern : '',
  buyBundle: fixtureSession ? shot.config.buyBundle : false,
  sellBundle: false,
  autoStart: false,
  devSellPercent: fixtureSession ? shot.config.devSellPercent : '',
  sell1: '',
  sell2: '',
  sell3: '',
  configRevision: 0,
  walletsCount: fixtureSession ? shot.wallet.count : '',
  includeRemoved: false,
  showAddresses: false,
  fundAmount: '',
  tokenSearch: '',
  countBox: fixtureSession ? shot.trading.countBox : '1',
  buyRange: fixtureSession ? shot.trading.buyRange : '',
  bundle: fixtureSession ? shot.trading.bundle : false,
  sellPercent: fixtureSession ? shot.trading.sellPercent : '',
  minBuy: fixtureSession ? shot.trading.minBuy : '',
  minSell: fixtureSession ? shot.trading.minSell : '',
  slipBuy: fixtureSession ? shot.trading.buySlippage : '',
  slipSell: fixtureSession ? shot.trading.sellSlippage : '',
  tip: fixtureSession ? shot.trading.tip : '',
  autoSell: fixtureSession ? shot.trading.autoSell : '',
  autoBuy: fixtureSession ? shot.trading.autoBuy : '',
  stopLoss: fixtureSession ? shot.trading.stopLoss : '',
  profitTarget: fixtureSession ? shot.trading.profitTarget : '',
  template: 'trending',
  source: fixtureSession ? fixtureSource : blankSource,
  generatedSource: fixtureSession ? fixtureSource : blankSource,
  artifact: null,
  diagnostics: [],
  selectedContract: '',
  compiling: false,
  saved: false,
  accounts: [],
  watchlist: [],
  watchRunning: false,
  dialog: null,
  toast: '',
  patch: (values) => set(values),
  showDialog: (title, body, links) => set({ dialog: { title, body, links } }),
  closeDialog: () => set({ dialog: null }),
  explain: (control) => {
    const body = blockedControlMessage(control) ?? 'No transaction was created.';
    set({ dialog: { title: 'Unavailable', body } });
  },
  setIdentity: (name, symbol) => {
    const state = get();
    try {
      if (!name || !symbol) {
        set({ name, symbol });
        return;
      }
      const rendered = renderTemplate(state.template, { name, symbol });
      if (state.source === state.generatedSource) {
        set({ name, symbol, source: rendered, generatedSource: rendered, artifact: null, diagnostics: [] });
      } else {
        set({ name, symbol });
      }
    } catch {
      set({ name, symbol });
    }
  },
  setTemplate: (template) => {
    const state = get();
    const name = state.name || 'Token';
    const symbol = state.symbol || 'TKN';
    try {
      const rendered = renderTemplate(template, { name, symbol });
      const pristine = state.source === state.generatedSource;
      set({
        template,
        source: pristine ? rendered : state.source,
        generatedSource: rendered,
        artifact: null,
        diagnostics: [],
        selectedContract: '',
      });
    } catch {
      set({ template, artifact: null });
    }
  },
  setSource: (source) => set({ source, artifact: null, diagnostics: [], saved: false, selectedContract: '' }),
  addAccounts: (records) => {
    const existing = new Set(get().accounts.map((account) => account.address.toLowerCase()));
    const next = [...get().accounts];
    for (const record of records) {
      if (existing.has(record.address.toLowerCase())) continue;
      existing.add(record.address.toLowerCase());
      next.push({ id: crypto.randomUUID(), name: record.name, address: record.address, kind: 'watch' });
    }
    set({ accounts: next });
  },
  logout: () => {
    void fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/v1/auth/logout`, {
      method: 'POST',
      headers: { 'x-launchpad-request': '1' },
      credentials: 'include',
    });
    window.location.assign('/');
  },
}));
