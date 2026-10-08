import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { compileSource } from '@launchpad/contracts';
import { findRepoRoot } from '@launchpad/shared/node';
import {
  NonceStore,
  blockedControlMessage,
  buildLaunchPlan,
  executionChain,
  exportAddressBook,
  parseAddressBook,
  redactRpcUrl,
  validateRpcUrl,
  v2AmountOut,
  type AppMode,
  type CompilationArtifact,
} from '@launchpad/shared';
import { getAddress, JsonRpcProvider } from 'ethers';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { SiweMessage } from 'siwe';

export interface ServerOptions {
  mode: AppMode;
  chainId: number;
  sessionSecret: string;
  allowedOrigins: string[];
  authDomain: string;
  authUri: string;
  owner?: string;
  allowed: string[];
  rpcHttpUrl?: string;
  rpcWsUrl?: string;
  explorerApiKey?: string;
  logger?: boolean;
}

interface Session {
  address: string;
  role: 'owner' | 'operator';
  expiresAt: number;
}

interface AccountRow {
  id: string;
  name: string;
  address: string;
  kind: 'watch';
  removed: boolean;
}

function fail(reply: FastifyReply, status: number, code: string, message: string) {
  return reply.code(status).send({ error: { code, message } });
}

export async function buildServer(options: ServerOptions): Promise<FastifyInstance> {
  executionChain(options.chainId);
  const owner = options.owner ? getAddress(options.owner) : undefined;
  const allowed = options.allowed.map((address) => getAddress(address));
  const nonces = new NonceStore();
  const sessions = new Map<string, Session>();
  const accounts: AccountRow[] = [];
  const artifacts = new Map<string, { source: string; artifact: CompilationArtifact }>();
  const idempotency = new Map<string, unknown>();
  const hits = new Map<string, { count: number; reset: number }>();
  let backendHttp = options.rpcHttpUrl;
  let backendWs = options.rpcWsUrl;
  const rpcAudit: Array<{ at: string; actor: string; http: string; ws: string }> = [];

  const app = Fastify({
    bodyLimit: 1_000_000,
    logger: options.logger ? { level: 'info', redact: ['req.headers.cookie', 'req.headers.authorization'] } : false,
  });
  await app.register(cookie, { secret: options.sessionSecret, hook: 'onRequest' });
  await app.register(cors, {
    origin: options.allowedOrigins,
    credentials: true,
    allowedHeaders: ['content-type', 'x-launchpad-request', 'idempotency-key'],
  });

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (typeof origin === 'string' && !options.allowedOrigins.includes(origin)) {
      return fail(reply, 403, 'ORIGIN', 'Origin is not allowed.');
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.headers['x-launchpad-request'] !== '1') {
      return fail(reply, 403, 'CSRF', 'Missing request header.');
    }
  });

  function limited(request: FastifyRequest): boolean {
    const ip = request.ip;
    const now = Date.now();
    const row = hits.get(ip);
    if (!row || row.reset < now) {
      hits.set(ip, { count: 1, reset: now + 60_000 });
      return false;
    }
    row.count += 1;
    return row.count > 60;
  }

  function readSession(request: FastifyRequest): Session | null {
    const raw = request.cookies.launchpad_session;
    if (!raw) return null;
    const unsigned = request.unsignCookie(raw);
    if (!unsigned.valid || !unsigned.value) return null;
    const session = sessions.get(unsigned.value);
    if (!session || session.expiresAt <= Date.now()) return null;
    return session;
  }

  function roleFor(address: string): Session['role'] | null {
    const normalized = getAddress(address);
    if (owner && normalized === owner) return 'owner';
    if (allowed.some((item) => item === normalized)) return 'operator';
    return null;
  }

  app.get('/v1/health', async () => {
    const heartbeatPath = join(findRepoRoot(), 'data', 'worker-heartbeat.json');
    let worker: 'ok' | 'stopped' = 'stopped';
    let latestIndexedBlock: number | null = null;
    if (existsSync(heartbeatPath)) {
      try {
        const heartbeat = JSON.parse(readFileSync(heartbeatPath, 'utf8')) as { at?: string; latestIndexedBlock?: number | null };
        if (heartbeat.at && Date.now() - Date.parse(heartbeat.at) < 20_000) worker = 'ok';
        if (typeof heartbeat.latestIndexedBlock === 'number') latestIndexedBlock = heartbeat.latestIndexedBlock;
      } catch {
        worker = 'stopped';
      }
    }
    return {
      ok: true,
      mode: options.mode,
      simulated: options.mode === 'demo',
      api: 'ok',
      worker,
      chainId: options.chainId,
      rpc: backendHttp ? 'configured' : 'not-configured',
      latestIndexedBlock,
      queue: 'not-enabled',
    };
  });

  app.post('/v1/auth/nonce', async (request, reply) => {
    if (limited(request)) return fail(reply, 429, 'RATE_LIMIT', 'Too many login attempts.');
    const body = request.body as { address?: string };
    if (!body?.address) return fail(reply, 400, 'ADDRESS', 'Address is required.');
    let address: string;
    try {
      address = getAddress(body.address);
    } catch {
      return fail(reply, 400, 'ADDRESS', 'Address is invalid.');
    }
    const nonce = nonces.issue(address);
    return { nonce, expiresInSeconds: 600 };
  });

  app.post('/v1/auth/verify', async (request, reply) => {
    if (limited(request)) return fail(reply, 429, 'RATE_LIMIT', 'Too many login attempts.');
    const body = request.body as { message?: string; signature?: string };
    if (!body?.message || !body.signature) return fail(reply, 400, 'SIWE', 'Message and signature are required.');
    let parsed: SiweMessage;
    try {
      parsed = new SiweMessage(body.message);
      if (parsed.domain !== options.authDomain || parsed.uri !== options.authUri || parsed.chainId !== options.chainId) {
        return fail(reply, 401, 'SIWE', 'Login domain, URI, or chain did not match.');
      }
      const verified = await parsed.verify({ signature: body.signature, domain: options.authDomain, nonce: parsed.nonce });
      if (!verified.success) return fail(reply, 401, 'SIWE', 'Signature verification failed.');
      if (!parsed.nonce || !nonces.consume(parsed.address, parsed.nonce)) {
        return fail(reply, 401, 'SIWE', 'Login nonce was already used or expired.');
      }
    } catch {
      return fail(reply, 401, 'SIWE', 'Signature verification failed.');
    }
    const role = roleFor(parsed.address);
    if (!role) return fail(reply, 403, 'WHITELIST', 'Wallet not whitelisted. Access is restricted.');
    const sessionId = randomBytes(32).toString('hex');
    sessions.set(sessionId, { address: getAddress(parsed.address), role, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
    reply.setCookie('launchpad_session', sessionId, {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    return { address: getAddress(parsed.address), role };
  });

  app.get('/v1/auth/session', async (request) => {
    const session = readSession(request);
    if (!session) return { authenticated: false };
    return { authenticated: true, address: session.address, role: session.role };
  });

  app.post('/v1/auth/logout', async (request, reply) => {
    const raw = request.cookies.launchpad_session;
    if (raw) {
      const unsigned = request.unsignCookie(raw);
      if (unsigned.valid && unsigned.value) sessions.delete(unsigned.value);
    }
    reply.clearCookie('launchpad_session', { path: '/' });
    return { ok: true };
  });

  app.get('/v1/accounts', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    return { accounts: accounts.map((account) => ({ ...account })) };
  });

  app.post('/v1/accounts/import', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    try {
      const records = parseAddressBook(request.body);
      for (const record of records) {
        if (accounts.some((account) => account.address === record.address)) continue;
        accounts.push({ id: randomBytes(16).toString('hex'), name: record.name, address: record.address, kind: 'watch', removed: false });
      }
      return { accounts };
    } catch (error) {
      return fail(reply, 400, 'IMPORT', error instanceof Error ? error.message : 'Import failed.');
    }
  });

  app.get('/v1/accounts/export', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    return exportAddressBook(accounts.filter((account) => !account.removed).map((account) => ({ name: account.name, address: account.address })));
  });

  app.post('/v1/compile', async (request, reply) => {
    if (options.mode !== 'demo' && !readSession(request)) return fail(reply, 401, 'AUTH', 'Sign in required.');
    const body = request.body as { source?: string };
    if (!body?.source || body.source.length > 200_000) return fail(reply, 400, 'SOURCE', 'Source is required.');
    const result = await compileSource(body.source);
    if (result.ok) artifacts.set(result.artifact.sourceHash, { source: body.source, artifact: result.artifact });
    return result;
  });

  app.post('/v1/verify', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    if (!options.explorerApiKey) {
      return fail(reply, 409, 'EXPLORER_NOT_CONFIGURED', 'Explorer verification is not configured. The contract was not redeployed.');
    }
    return reply.code(409).send({
      submitted: false,
      error: {
        code: 'VERIFICATION_HELD',
        message: 'The compilation settings were retained. Automatic explorer submission is disabled. Retry verification later without redeploying.',
      },
    });
  });

  app.post('/v1/launches', async (request, _reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key === 'string' && idempotency.has(key)) return idempotency.get(key);
    const plan = buildLaunchPlan({ hasArtifact: false, hasOpenTrade: false });
    if (typeof key === 'string') idempotency.set(key, plan);
    return plan;
  });

  app.post('/v1/engine/run', async (_request, reply) => {
    return reply.code(409).send({ submitted: false, error: { code: 'ENGINE_UNAVAILABLE', message: blockedControlMessage('engine-run') } });
  });

  app.post('/v1/engine/stop', async (_request, _reply) => ({ stopped: true, note: 'Stop prevents new jobs. There is no running strategy to cancel.' }));

  app.post('/v1/transactions', async (_request, reply) => {
    return reply.code(409).send({
      submitted: false,
      error: { code: 'SUBMISSION_DISABLED', message: 'This API does not hold a signer and does not broadcast transactions.' },
    });
  });

  app.post('/v1/bundles', async (_request, reply) => {
    return reply.code(409).send({
      submitted: false,
      included: false,
      error: { code: 'BUNDLE_UNAVAILABLE', message: 'Bundle relay submission is not enabled. Relay acceptance would not prove inclusion.' },
    });
  });

  app.post('/v1/quote', async (request, reply) => {
    const body = request.body as { amountIn?: string; reserveIn?: string; reserveOut?: string };
    try {
      const amountOut = v2AmountOut(BigInt(body.amountIn ?? ''), BigInt(body.reserveIn ?? ''), BigInt(body.reserveOut ?? ''));
      return {
        amountOut: amountOut.toString(),
        estimate: true,
        executable: false,
        simulated: options.mode === 'demo',
      };
    } catch {
      return fail(reply, 400, 'QUOTE', 'A positive amount and both reserves are required. This is not an executable quote.');
    }
  });

  app.get('/v1/rpc', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    return {
      http: backendHttp ? redactRpcUrl(backendHttp) : null,
      ws: backendWs ? redactRpcUrl(backendWs) : null,
      audit: session.role === 'owner' ? rpcAudit : [],
    };
  });

  app.put('/v1/rpc', async (request, reply) => {
    const session = readSession(request);
    if (!session) return fail(reply, 401, 'AUTH', 'Sign in required.');
    if (session.role !== 'owner') return fail(reply, 403, 'ROLE', 'Only the owner can change backend RPC settings.');
    const body = request.body as { http?: string; ws?: string };
    if (body.http) {
      const checked = validateRpcUrl(body.http, options.mode);
      if (!checked.ok) return fail(reply, 400, 'RPC', checked.error);
      backendHttp = checked.href;
    }
    if (body.ws) {
      const checked = validateRpcUrl(body.ws, options.mode);
      if (!checked.ok) return fail(reply, 400, 'RPC', checked.error);
      backendWs = checked.href;
    }
    rpcAudit.push({
      at: new Date().toISOString(),
      actor: session.address,
      http: backendHttp ? redactRpcUrl(backendHttp) : '',
      ws: backendWs ? redactRpcUrl(backendWs) : '',
    });
    return { http: backendHttp ? redactRpcUrl(backendHttp) : null, ws: backendWs ? redactRpcUrl(backendWs) : null };
  });

  app.post('/v1/rpc/probe', async (request, reply) => {
    const session = readSession(request);
    if (!session || session.role !== 'owner') return fail(reply, 403, 'ROLE', 'Only the owner can probe backend RPC settings.');
    if (!backendHttp) return { http: 'not-configured', ws: backendWs ? 'configured' : 'not-configured' };
    const checked = validateRpcUrl(backendHttp, options.mode);
    if (!checked.ok) return { http: 'rejected', detail: checked.error };
    const provider = new JsonRpcProvider(backendHttp);
    try {
      const network = await Promise.race([
        provider.getNetwork(),
        new Promise<never>((_resolve, reject) => {
          setTimeout(() => reject(new Error('timeout')), 4000);
        }),
      ]);
      if (network.chainId !== BigInt(options.chainId)) return { http: 'chain-mismatch' };
      return { http: 'ok', ws: backendWs ? 'configured' : 'not-configured' };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('401') || message.includes('403')) return { http: 'credential-rejected' };
      if (message.includes('429')) return { http: 'rate-limited' };
      return { http: 'unreachable' };
    } finally {
      provider.destroy();
    }
  });

  app.get('/v1/watch/logs', async () => {
    const logPath = join(findRepoRoot(), 'data', 'watch-logs.json');
    if (!existsSync(logPath)) {
      return { logs: [], history: 'empty', note: 'No indexed logs are stored.' };
    }
    const logs = JSON.parse(readFileSync(logPath, 'utf8')) as unknown[];
    return {
      logs,
      history: 'partial',
      note: 'Indexing does not cover a full history unless it starts at deployment. These rows are indexed logs, not a profit calculation.',
    };
  });

  return app;
}
