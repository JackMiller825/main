# ETH LaunchPad

Dark Ethereum launch and trading console. Demo mode opens without a wallet, RPC key, or funds. Live mode uses your own API, chain, and allow list. It does not connect to the reference site.

The previous MUSKPAT site that lived in this folder is in `_archive/muskpat`. This repository publishes its own demo from `.github/workflows/pages.yml`.

## Requirements

Node.js 22.12 or newer. This machine was exercised on Node 24.

## Demo

```bash
npm install
npm run dev
```

The app listens on http://127.0.0.1:5173 and the API on http://127.0.0.1:3001.

Every push to `main` on https://github.com/JackMiller825/main builds the demo frontend and deploys it to GitHub Pages at https://ethlp.site/. Pages serves that static demo only. The API and worker need their own host.

Screenshot fixtures, with display values only:

- http://127.0.0.1:5173/?fixture=trading
- http://127.0.0.1:5173/?fixture=config
- http://127.0.0.1:5173/?fixture=config&scroll=advanced
- http://127.0.0.1:5173/?fixture=wallet
- http://127.0.0.1:5173/?fixture=editor

`&capture=1` hides the demo banner. A banner is shown otherwise so fixture prices, wallet counts, and BNB labels are not read as live data.

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Live services

Copy `.env.example` to `.env` and replace the placeholders. Then:

```bash
docker compose up -d
npm run db:migrate
npm run dev:live
```

`dev:live` stops if the database URL, RPC URL, or session secret is missing. It does not substitute demo balances.

Browser-facing variables are `VITE_APP_MODE`, `VITE_API_BASE_URL`, and `VITE_CHAIN_ID`. Do not put keys or private material in them.

## Docs

- [Feature parity](docs/FEATURE-PARITY.md)
- [Assets](docs/ASSET-INVENTORY.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Operations](docs/OPERATIONS.md)
- [Known gaps](docs/KNOWN-GAPS.md)

## Boundaries

Address books store names and addresses. Import rejects private-key fields. `Download PKs` does not create a file. Engine Run does not sign or queue orders. SB, D-F, SS, US, and Add WL cannot send transactions. Execution is Ethereum only, even when a fixture label says BNB.
