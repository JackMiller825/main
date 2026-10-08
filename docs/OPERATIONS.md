# Operations

## Roles

| Role | Meaning |
| --- | --- |
| Connected wallet | Session identity in the header. |
| Action wallet | Manual trading status. Not assumed to be the login wallet. |
| Deployer | Launch form’s first account. Empty until a real account exists. |
| Mother wallet | Engine funding target. |
| Master wallet | Funds the mother wallet and is the withdrawal destination. |

A watch address cannot trade. A login signature does not approve a swap. Removing a registry row does not delete the chain account or its assets.

## Daily

- API and worker health.
- RPC errors and the latest indexed block.
- Pending transactions, if you later enable browser-wallet submission.
- ETH balance of any wallet you actually use.
- Registry counts from the database, not from the screenshot fixture.

## Weekly

- Database backup and a restore test in another environment.
- Failed jobs, once a queue exists.
- RPC and host usage.
- The operator allow list.
- Dependency updates.

## Before any chain action

Confirm the chain id, artifact hash, signer, constructor arguments, and gas estimate. Renounce and LP burn are different operations. Neither one proves that every other permission is closed. This build does not send those transactions.

## Failures

| Symptom | Check |
| --- | --- |
| Login fails | Account, rejected signature, expired nonce, domain, allow list. |
| Blank dashboard | Frontend error, API, session, API URL. |
| No trades or holders | Worker, RPC logs, cursor, and whether indexing started after deployment. |
| ETH and BNB labels disagree | Fixture mode is showing a captured label. Execution still uses the configured Ethereum chain. |
| Engine Stop seems to do nothing | Stop only prevents new jobs. There is no live strategy in this build. |

## Backup

Back up git history, the database, compilation artifacts, and deployment receipts. Keep signer recovery separate from database backups. Restoring the database must not expose a private key, because ordinary rows do not contain one.

After a restore, compare nonces and receipts before considering any future submission, so a recovered job cannot be sent twice.
