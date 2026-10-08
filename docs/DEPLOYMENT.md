# Deployment

The app has three processes: the Vite frontend, the API, and the worker. Static hosting can serve the frontend only. The API and worker need their own runtime, plus Postgres for durable mode. Redis is reserved for a queue and is not required for the demo.

## Local demo

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173. Fixture URLs:

- `/?fixture=trading`
- `/?fixture=config`
- `/?fixture=config&scroll=advanced`
- `/?fixture=wallet`
- `/?fixture=editor`

Add `&capture=1` to hide the demo banner while comparing screenshots. Compare at the same zoom and device-pixel ratio. The guide’s scale of about 0.8 is an inference, not a CSS size.

## Local live or fork

1. Start Postgres and Redis with `docker compose up -d` if you want those services.
2. Copy `.env.example` to `.env` and replace every placeholder. Use your own RPC, explorer key, owner address, and allow list.
3. Apply migrations: `npm run db:migrate`.
4. Start `npm run dev:live`.

`dev:live` refuses to start without the database, RPC URL, and session secret. It does not fall back to fixture balances. Do not point it at the reference site.

Sepolia is chain id `11155111`. Mainnet is `1`. Set `UNISWAP_V2_ROUTER` yourself for Sepolia. Mainnet uses the official Uniswap V2 router `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`.

## Production order

1. Create the database and, if used later, Redis.
2. Set secrets and chain id in the host, not in `VITE_` variables.
3. Run migrations.
4. Start the API and worker.
5. Check `/v1/health` and the latest indexed block.
6. Build the frontend with `VITE_APP_MODE=live` and the public API origin.
7. Serve the web `dist` directory.
8. Use HTTPS and `wss` for production sockets.
9. Set `ALLOWED_ORIGINS`, `AUTH_DOMAIN`, and `AUTH_URI` to the real frontend origin.

Put the frontend on the site origin and the API on an `api` hostname only after the host gives you the DNS records. Copy those records into the registrar. Do not reuse another project’s DNS.

A frontend-only host cannot run login, indexing, or compilation.

## Rollback

Redeploy the previous git revision to roll back the software. That does not reverse a confirmed chain transaction.
