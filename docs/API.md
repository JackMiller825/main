# API

Base path: `/v1`. Browser writes send `x-launchpad-request: 1`. Cookie writes use an HttpOnly session cookie.

Amounts at the boundary are decimal strings. Records that identify an address or transaction include the configured chain id. The only execution chains are Ethereum mainnet (`1`) and Sepolia (`11155111`).

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/v1/health` | API, worker heartbeat, chain, RPC configuration, latest indexed block. `simulated: true` in demo. Queue reports `not-enabled`. |
| POST | `/v1/auth/nonce` | One-time nonce for an address. |
| POST | `/v1/auth/verify` | Checks SIWE domain, URI, chain, nonce, and signature, then consumes the nonce. Unknown wallets get “Wallet not whitelisted.” |
| GET | `/v1/auth/session` | Current cookie session. |
| POST | `/v1/auth/logout` | Clears the session. |
| GET | `/v1/accounts` | Watch-only name and address rows. |
| POST | `/v1/accounts/import` | Rejects private-key, mnemonic, and keystore fields. |
| GET | `/v1/accounts/export` | Name and address only. |
| POST | `/v1/compile` | solc 0.8.24 Standard JSON. Demo allows local compile. Live requires a session. |
| POST | `/v1/verify` | Does not redeploy. Without an explorer key it returns `EXPLORER_NOT_CONFIGURED`. |
| POST | `/v1/launches` | Returns a plan with `submitted: false`. Idempotency-Key repeats that same plan. |
| POST | `/v1/engine/run` | `409` and `submitted: false`. |
| POST | `/v1/engine/stop` | Idempotent. It does not claim to undo a broadcast. |
| POST | `/v1/transactions` | `SUBMISSION_DISABLED`. This process has no signer. |
| POST | `/v1/bundles` | `submitted: false` and `included: false`. |
| POST | `/v1/quote` | Constant-product estimate from caller-supplied reserves. `executable: false`. |
| GET/PUT | `/v1/rpc` | Owner can update backend URLs. Responses are redacted. Live mode rejects localhost and private hosts. |
| POST | `/v1/rpc/probe` | Owner-only chain probe. Statuses include ok, credential-rejected, rate-limited, unreachable, and not-configured. |
| GET | `/v1/watch/logs` | Indexed logs only. History is marked partial unless a full backfill was actually run. |

Demo mode does not require Postgres. `APP_MODE=live` or `fork` exits unless `DATABASE_URL`, `RPC_HTTP_URL`, and a 32-character `SESSION_SECRET` are set.
