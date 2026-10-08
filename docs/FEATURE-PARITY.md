# Feature parity

Evidence labels:

- **Browser:** public gate inspected on October 7, 2026.
- **Screenshot:** one of Screenshot_3.png through Screenshot_8.png. Those files were not in this workspace, so pixel comparison against them was not run here.
- **Source-derived:** described from the public frontend, not shown in the six screenshots.
- **Proposed:** chosen for this rebuild.
- **Unavailable:** visible or named, but it cannot send a transaction.

| Area | Evidence | This build |
| --- | --- | --- |
| Public gate, header, colors, typography | Browser | Implemented to the written measurements. Not compared with a fresh browser capture of the reference site in this session. |
| Launch / trading / manual empty state | Screenshot | Demo fixture `/?fixture=trading`. |
| Config top and lower scroll | Screenshot | `/?fixture=config` and `/?fixture=config&scroll=advanced`. |
| Engine wallet registry | Screenshot | `/?fixture=wallet`. Counts and the BNB label are fixture display only. |
| Uncompiled Trending editor | Screenshot | `/?fixture=editor`. Deploy controls stay hidden until a compile artifact exists. |
| Trading wider than Watch; Editor columns equal | Screenshot | CSS grid `1.57fr / 1fr` for trading and `1fr / 1fr` for the editor. |
| Manual engine tab, RPC modal, account dialogs, populated tables | Source-derived | Present and labeled. Not claimed as screenshot-verified. |
| Mobile layout | Proposed | Panels stack below 1100px. Not visually verified against a reference capture. |
| SIWE login, roles, account metadata | Proposed | Implemented. A login signature is not a trading approval. |
| solc 0.8.24 Standard JSON compile | Proposed | Local compiler. Reviewed templates are generated here and are not copied from the reference site. |
| Uniswap V2 quote math and mainnet router address | Proposed | Spot quote only. Sepolia router is not assumed. |
| Chart-pattern engine, disperse scheduling, multi-account launch buys | Unavailable | Controls can be shown. Run does not queue or sign orders. |
| SS, US, Add WL, D-F, SB, Auto-SB | Unavailable | They cannot build a transaction. |
| Download PKs | Screenshot label | The button is visible in the fixture and does not create a file. |
| Bundle relay | Unavailable | Simulation, acceptance, and inclusion are not claimed. The API returns not submitted. |
| Server signer and raw private keys | Rejected | Address records only. Server key environment variables are ignored. |

Screenshot numbers, including the 100% sell-slippage field, the $2571.67 chip, and wallet counts of 200, are fixture display values. Live mode ignores `?fixture=` and does not load them.
