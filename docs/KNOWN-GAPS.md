# Known gaps

The six screenshot files were not in the workspace. Layout follows the written measurements and fixture values. It is not a verified pixel match to those images, and it is not a verified match to a live authenticated session on the reference site.

Not implemented, on purpose:

- Chart-pattern orders (CAH, FW, AT, Mix), interval buys and sells, and multi-wallet disperse. The original strategy was not available, and this build does not invent one.
- Multi-account launch buys and bundle relay submission.
- SS, US, Add WL, D-F, SB, and Auto-SB transaction paths.
- Plaintext private-key export, key generation, and server-side signing.
- A claim that holders or profit are complete. Spot reserve ratios are estimates and omit price impact.
- Clanker fee claims, PancakeSwap, FourMeme, and V4 pool adapters.
- Automatic explorer submission. Verification will not redeploy a contract to retry.
- A production WebSocket fan-out. The worker can poll logs in live mode when `RPC_HTTP_URL` and `WATCH_PAIR_ADDRESS` are set, and it starts near the current head, so history is partial.
- Mobile appearance against a reference capture.

`Download PKs`, BNB labels on Config and Wallet, and the disabled 100% sell-slippage field exist so the demo fixture can resemble the captures. They are not live settings.

The previous site in this repository is archived at `_archive/muskpat`. Its Pages workflow was archived with it so this app is not deployed over that domain by the old workflow.
