import { createSiweMessage } from '@launchpad/shared';
import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import { afterEach, describe, expect, it } from 'vitest';
import { buildServer, type ServerOptions } from './buildServer.js';

const wallet = Wallet.createRandom();
const csrf = { 'x-launchpad-request': '1', origin: 'http://localhost:5173' };

function options(): ServerOptions {
  return {
    mode: 'demo',
    chainId: 11155111,
    sessionSecret: 'demo-session-secret-not-for-production',
    allowedOrigins: ['http://localhost:5173'],
    authDomain: 'localhost:5173',
    authUri: 'http://localhost:5173',
    owner: wallet.address,
    allowed: [],
    logger: false,
  };
}

describe('api boundaries', () => {
  let app: Awaited<ReturnType<typeof buildServer>> | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('reports demo health without pretending the worker is up', async () => {
    app = await buildServer(options());
    const response = await app.inject({ method: 'GET', url: '/v1/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ mode: 'demo', simulated: true, queue: 'not-enabled' });
  });

  it('signs in once and rejects a reused nonce and a private-key import', async () => {
    app = await buildServer(options());
    const nonceResponse = await app.inject({
      method: 'POST',
      url: '/v1/auth/nonce',
      headers: csrf,
      payload: { address: wallet.address },
    });
    const { nonce } = nonceResponse.json() as { nonce: string };
    const issuedAt = new Date().toISOString();
    const message = createSiweMessage({
      domain: 'localhost:5173',
      address: wallet.address,
      statement: 'Sign in to ETH LaunchPad.',
      uri: 'http://localhost:5173',
      chainId: 11155111,
      nonce,
      issuedAt,
      expirationTime: new Date(Date.now() + 60_000).toISOString(),
    });
    const signature = await wallet.signMessage(message);
    const verify = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify',
      headers: csrf,
      payload: { message, signature },
    });
    expect(verify.statusCode).toBe(200);
    const cookie = verify.headers['set-cookie'];
    expect(cookie).toBeTruthy();
    const replay = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify',
      headers: csrf,
      payload: { message, signature },
    });
    expect(replay.statusCode).toBe(401);

    const imported = await app.inject({
      method: 'POST',
      url: '/v1/accounts/import',
      headers: { ...csrf, cookie: String(cookie).split(';')[0] },
      payload: { accounts: [{ name: 'Desk', address: wallet.address, privateKey: 'secret' }] },
    });
    expect(imported.statusCode).toBe(400);
    expect(imported.json().error.message).toMatch(/private keys/);
  });

  it('does not start the engine or broadcast a bundle', async () => {
    app = await buildServer(options());
    const engine = await app.inject({ method: 'POST', url: '/v1/engine/run', headers: csrf, payload: {} });
    const bundle = await app.inject({ method: 'POST', url: '/v1/bundles', headers: csrf, payload: {} });
    expect(engine.statusCode).toBe(409);
    expect(engine.json().submitted).toBe(false);
    expect(bundle.json()).toMatchObject({ submitted: false, included: false });
  });

  it('rejects an unlisted wallet', async () => {
    const stranger = Wallet.createRandom();
    app = await buildServer(options());
    const nonceResponse = await app.inject({
      method: 'POST',
      url: '/v1/auth/nonce',
      headers: csrf,
      payload: { address: stranger.address },
    });
    const { nonce } = nonceResponse.json() as { nonce: string };
    const message = new SiweMessage({
      domain: 'localhost:5173',
      address: stranger.address,
      statement: 'Sign in to ETH LaunchPad.',
      uri: 'http://localhost:5173',
      version: '1',
      chainId: 11155111,
      nonce,
      issuedAt: new Date().toISOString(),
    }).prepareMessage();
    const signature = await stranger.signMessage(message);
    const verify = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify',
      headers: csrf,
      payload: { message, signature },
    });
    expect(verify.statusCode).toBe(403);
    expect(verify.json().error.message).toMatch(/not whitelisted/);
  });
});
