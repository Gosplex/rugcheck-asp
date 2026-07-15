# RugCheck — dev log & hackathon notes

Internal build notes for the **OKX.AI Genesis Hackathon**. Product docs live in [README.md](README.md).

## Why this project

- **Hackathon:** OKX.AI Genesis Hackathon — $100,000 prize pool, deadline **Jul 17, 2026 23:59 UTC**.
- **Target prizes:** Software Utility ($2,500) + Social Buzz ($1,000). The same ASP can win both.
- **Why it's winnable fast:** the real-world use case is clear, the demo is shareable on X, and the
  on-chain data heavy-lifting is available through OKX's Onchain OS tooling.

## What an ASP needs (to list on OKX.AI)

The agent's service must be **reachable by others**. Two delivery paths:

| Path | Needs | Pricing |
|---|---|---|
| **API service (A2MCP)** | A real, deployed, public `https://` endpoint (permanent on-chain) | Pay-per-call, fixed |
| **Agent-to-agent (A2A)** | The OKX A2A communication runtime set up | Negotiable / off-chain |

Plus, for **any** ASP: a **required avatar image** (square logo, uploaded as a file — not a link).
Building the API-service endpoint first keeps both options open (an endpoint can also back an A2A agent later).

## Wallet (Agentic Wallet)

- EVM: `0x841bd75ed39f112356ae1a1210b7a387fea43e19`
- Solana: `bJ7u6t3z8EUR5ym88aFYTuqpGmrQwd5ezeJFRfz3cAa`

## Plan (build code first, register second)

1. **Build the RugCheck service** — an HTTP endpoint that takes a token + chain and returns a structured safety report.
2. **Deploy it** to a public host for a permanent `https://` URL.
3. **Prepare an avatar** — a square logo image file (`assets/logo.png`).
4. **Register the ASP** on OKX.AI with the deployed endpoint URL, pass review, go live.
5. **Record a <90s demo**, post on X with **#OKXAI**.
6. **Submit the Google Form** with ASP details + the X post link **before Jul 17 23:59 UTC**.

## Progress log

- [x] Installed Onchain OS skills + the `onchainos` CLI (v4.2.4); logged into the Agentic Wallet.
- [x] Built the core service: `analyze.js` (fetch + verdict), `server.js` (HTTP API + UI), `page.js`
      (self-contained web UI), `cli-check.js` (terminal tester), `assets/logo.png` (brand/avatar).
- [x] Tested locally: USDC → 🟢 LOW; hot tokens resolve; bad addresses rejected.
- [x] Added the AI analyst layer (`ai.js` → OpenRouter): executive summary, per-risk explanations,
      critical/important/minor prioritization, confidence, scam-pattern recognition, and modes.
- [x] Redesigned the UI (instrument console + AI report + chat). Deep links auto-run.
- [x] Verified graceful degradation with no API key (deterministic scan unaffected).
- [x] Hardened the pipeline:
      - Wrong chain / bad address no longer fakes a "clean 🟢 LOW" verdict → `found:false` → `UNKNOWN`
        with a "check the address and chain" message; AI is skipped on empty data.
      - AI report fields render markdown instead of raw asterisks (`page.js` `fmt()`); fixed an
        unescaped-backtick bug that broke the page template.
      - AI system prompt forbids em/en dashes.
- [x] Branding: `assets/logo.png` (1254×1254 square) as header mark + favicon, served at `/logo.png`.
- [x] Engagement features (frontend-only, engine/AI architecture unchanged):
      - **Explain This** — per-signal Explain buttons, grounded + cached, reusing `/chat` (no new AI pipeline).
      - **Share Card** + **Post on X** — branded canvas card, reusing the AI executive summary (no extra AI call).
      - QoL: example tokens, copy address + explorer link, recent scans, verified line, skeleton, toasts.
- [x] Swapped `runReport()` from the `onchainos` CLI to the **OKX Web3 HTTP API** (`https://web3.okx.com`),
      so it deploys anywhere. **Verified live with a real key.** Exact calls:
      - `POST /api/v6/dex/market/token/basic-info` — body `[{chainIndex, tokenContractAddress}]`
      - `POST /api/v6/dex/market/price-info` — body `[{chainIndex, tokenContractAddress}]`
      - `POST /api/v6/security/token-scan` — body `{source:"1", tokenList:[{chainId, contractAddress}]}`
      - `GET  /api/v6/dex/market/token/advanced-info` — query `chainIndex`, `tokenContractAddress`
      - Auth: `OK-ACCESS-KEY/SIGN/TIMESTAMP/PASSPHRASE/PROJECT` (HMAC-SHA256). Auto HTTP when
        `OKX_API_KEY` is set, else CLI; force with `RUGCHECK_SOURCE=http|cli`.
      - Smoke: USDC/ETH → 🟢 OK, PEPE/ETH → 🟢 OK, USDC-on-Solana (wrong chain) → UNKNOWN/`found:false`.

### Remaining

- [ ] Deploy to Render → permanent `https://` URL. Set env vars on the host (see README → Configuration).
- [ ] Keep-warm: point a free uptime monitor (UptimeRobot / cron-job.org) at `/health` every ~10 min.
- [ ] Test the live AI path (enrichment + chat) on the deployed host.
- [ ] Accept OKX.AI marketplace terms (one-time wallet consent).
- [ ] Register + activate ASP on OKX.AI with the deployed URL; pass review.
- [ ] Record demo, post on X (#OKXAI), submit Google Form before the deadline.

## Notes / risks

- The endpoint URL is **permanent on-chain** once registered — lock in the host before registering.
- OKX free-tier API has rate limits (`50011 Too Many Requests`); RugCheck fires 4 calls per scan.
- Secrets have passed through local files during setup — **rotate the OKX key** before any public push.
- RugCheck presents factual on-chain data only; it must never give investment advice.
</content>
</invoke>
