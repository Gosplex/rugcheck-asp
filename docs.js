// Developer documentation page. Self-contained HTML, styled to match the app
// (same graphite instrument-console theme). Served at GET /docs. Static — no JS.
export const DOCS = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RugCheck AI · Developer docs</title>
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --ground:#0C0E13; --panel:#13161E; --panel-2:#191D27; --line:#262B36; --line-2:#333A48;
    --text:#EDEFF4; --muted:#A8AFBE; --faint:#767E8F;
    --safe:#35D6A4; --warn:#F2B84B; --danger:#FF5C7A;
    --display:'Space Grotesk',system-ui,sans-serif;
    --body:'Inter',system-ui,sans-serif;
    --mono:'JetBrains Mono',ui-monospace,monospace;
    color-scheme: dark;
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  html, body { margin:0; }
  body {
    font-family:var(--body); color:var(--text); background:var(--ground);
    line-height:1.65; -webkit-font-smoothing:antialiased;
    background-image:
      radial-gradient(120% 80% at 50% -10%, rgba(53,214,164,0.05), transparent 60%),
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size:100% 100%, 46px 46px, 46px 46px;
    background-position:0 0, -1px -1px, -1px -1px;
    background-attachment:fixed;
  }
  a { color:var(--safe); text-decoration:none; }
  a:hover { text-decoration:underline; }

  /* Header */
  header { position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:12px;
           padding:14px 24px; border-bottom:1px solid var(--line); background:rgba(12,14,19,0.82);
           backdrop-filter:blur(10px); }
  .mark { width:34px; height:34px; flex:none; border:1px solid var(--line-2); border-radius:9px;
          overflow:hidden; background:var(--panel); }
  .mark img { width:100%; height:100%; object-fit:cover; display:block; }
  .wordmark { font-family:var(--display); font-weight:700; font-size:18px; letter-spacing:-0.01em; }
  .wordmark b { color:var(--safe); }
  .eyebrow { font-family:var(--mono); font-size:10.5px; letter-spacing:0.16em; text-transform:uppercase;
             color:var(--faint); margin-top:1px; }
  header .spacer { flex:1; }
  header .cta { font-family:var(--mono); font-size:12px; letter-spacing:0.04em; color:var(--text);
                border:1px solid var(--line-2); border-radius:9px; padding:8px 13px; }
  header .cta:hover { border-color:var(--safe); text-decoration:none; }

  /* Layout */
  .layout { max-width:1080px; margin:0 auto; display:grid; grid-template-columns:220px 1fr;
            gap:40px; padding:36px 24px 96px; }
  nav.toc { position:sticky; top:78px; align-self:start; font-size:13.5px; }
  nav.toc .group { font-family:var(--mono); font-size:10.5px; letter-spacing:0.14em; text-transform:uppercase;
                   color:var(--faint); margin:18px 0 8px; }
  nav.toc .group:first-child { margin-top:0; }
  nav.toc a { display:block; color:var(--muted); padding:5px 10px; border-left:2px solid var(--line);
              border-radius:0 6px 6px 0; }
  nav.toc a:hover { color:var(--text); border-left-color:var(--line-2); background:var(--panel); text-decoration:none; }

  main { min-width:0; }
  .lede { font-size:16px; color:#C2C8D4; max-width:60ch; }
  .lede b { color:var(--text); font-weight:500; }
  section { padding-top:30px; margin-top:14px; border-top:1px solid var(--line); }
  section:first-of-type { border-top:0; margin-top:0; padding-top:6px; }
  h1 { font-family:var(--display); font-weight:700; font-size:30px; letter-spacing:-0.02em; margin:0 0 12px; }
  h2 { font-family:var(--display); font-weight:600; font-size:21px; letter-spacing:-0.01em; margin:0 0 12px;
       scroll-margin-top:80px; }
  h3 { font-family:var(--display); font-weight:600; font-size:15px; margin:22px 0 8px; color:var(--text); }
  p { margin:0 0 12px; color:var(--muted); }
  p b, li b { color:var(--text); font-weight:500; }
  ul { margin:0 0 12px; padding-left:20px; color:var(--muted); }
  li { margin:4px 0; }
  code { font-family:var(--mono); font-size:12.5px; background:var(--panel-2); border:1px solid var(--line);
         border-radius:5px; padding:1px 6px; color:var(--text); }

  /* Callout */
  .note { border:1px solid var(--line-2); border-left:3px solid var(--safe); border-radius:10px;
          background:var(--panel); padding:13px 16px; margin:14px 0; font-size:14px; color:var(--text); }
  .note.warn { border-left-color:var(--warn); }

  /* Method + URL line */
  .route { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin:16px 0 10px; }
  .verb { font-family:var(--mono); font-weight:600; font-size:11px; letter-spacing:0.08em; padding:4px 9px;
          border-radius:6px; }
  .verb.get { color:var(--safe); background:color-mix(in srgb, var(--safe) 13%, transparent);
              border:1px solid color-mix(in srgb, var(--safe) 40%, var(--line)); }
  .verb.post { color:var(--warn); background:color-mix(in srgb, var(--warn) 13%, transparent);
               border:1px solid color-mix(in srgb, var(--warn) 40%, var(--line)); }
  .path { font-family:var(--mono); font-size:14px; color:var(--text); }

  /* Code blocks */
  pre { background:var(--panel); border:1px solid var(--line-2); border-radius:11px; padding:15px 16px;
        overflow-x:auto; margin:12px 0; font-family:var(--mono); font-size:12.5px; line-height:1.6; color:#DCE0E8; }
  pre code { background:none; border:0; padding:0; font-size:inherit; color:inherit; }
  .cap { font-family:var(--mono); font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase;
         color:var(--faint); margin:16px 0 -4px; }

  /* Tables */
  table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13.5px; }
  th, td { text-align:left; padding:9px 12px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-family:var(--mono); font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase;
       color:var(--faint); font-weight:500; }
  td { color:var(--muted); }
  td code { white-space:nowrap; }
  .req { color:var(--warn); font-family:var(--mono); font-size:11px; }
  .opt { color:var(--faint); font-family:var(--mono); font-size:11px; }

  .pill { display:inline-block; font-family:var(--mono); font-size:11px; padding:2px 8px; border-radius:999px;
          border:1px solid var(--line-2); color:var(--muted); margin:0 4px 4px 0; }

  footer { max-width:1080px; margin:0 auto; padding:24px; border-top:1px solid var(--line);
           font-family:var(--mono); font-size:12px; color:var(--faint); }

  @media (max-width:820px) {
    .layout { grid-template-columns:1fr; gap:20px; }
    nav.toc { position:static; display:flex; flex-wrap:wrap; gap:4px; border-bottom:1px solid var(--line);
              padding-bottom:14px; }
    nav.toc .group { width:100%; margin:10px 0 4px; }
    nav.toc a { border-left:0; border:1px solid var(--line); border-radius:999px; padding:5px 11px; }
  }
</style>
</head>
<body>
  <header>
    <a class="mark" href="/" aria-label="RugCheck home"><img src="/logo.png" alt="RugCheck" /></a>
    <div>
      <div class="wordmark">Rug<b>Check</b> AI</div>
      <div class="eyebrow">Developer docs</div>
    </div>
    <span class="spacer"></span>
    <a class="cta" href="/">Open scanner →</a>
  </header>

  <div class="layout">
    <nav class="toc" aria-label="Contents">
      <div class="group">Start</div>
      <a href="#overview">Overview</a>
      <a href="#base-url">Base URL &amp; auth</a>
      <div class="group">API</div>
      <a href="#rest">Scan (REST)</a>
      <a href="#mcp">MCP tool (A2MCP)</a>
      <a href="#utility">Utility endpoints</a>
      <div class="group">Reference</div>
      <a href="#response">Response fields</a>
      <a href="#chains">Chains &amp; modes</a>
      <a href="#errors">Errors</a>
    </nav>

    <main>
      <section id="overview">
        <h1>RugCheck AI — Developer docs</h1>
        <p class="lede">RugCheck reads a token's <b>OKX Onchain OS</b> security data and turns it into a
          plain-English safety report: a verdict, a 0–100 risk score, the risk flags found, and an
          optional AI explanation. The deterministic engine produces the facts and the verdict; the AI
          layer only explains them and never invents data.</p>
        <div class="note">Free to use, no API key required. RugCheck reports factual on-chain data —
          <b>it is not investment advice.</b></div>
        <p>Two ways to integrate:</p>
        <ul>
          <li><b>REST</b> — a simple <code>GET /rugcheck</code> JSON endpoint. Best for scripts, backends, and quick tests.</li>
          <li><b>MCP (A2MCP)</b> — an <code>POST /mcp</code> Model Context Protocol tool. Best for AI agents and the OKX.AI marketplace.</li>
        </ul>
      </section>

      <section id="base-url">
        <h2>Base URL &amp; authentication</h2>
        <pre><code>https://rugcheck-asp.onrender.com</code></pre>
        <p>All endpoints are served from this host. There is <b>no authentication</b> — the service is
          public and free. CORS is open (<code>Access-Control-Allow-Origin: *</code>), so browser clients
          can call it directly.</p>
      </section>

      <section id="rest">
        <h2>Scan a token (REST)</h2>
        <div class="route"><span class="verb get">GET</span><span class="path">/rugcheck</span></div>
        <p>Returns the deterministic safety report for one token. Add <code>ai=1</code> to attach the AI
          analyst section.</p>

        <div class="cap">Query parameters</div>
        <table>
          <tr><th>Param</th><th>Required</th><th>Description</th></tr>
          <tr><td><code>address</code></td><td><span class="req">required</span></td><td>Token contract address — an EVM <code>0x…</code> address or a Solana base58 address.</td></tr>
          <tr><td><code>chain</code></td><td><span class="opt">optional</span></td><td>Chain name (default <code>ethereum</code>). See <a href="#chains">supported chains</a>.</td></tr>
          <tr><td><code>ai</code></td><td><span class="opt">optional</span></td><td>Set to <code>1</code> to include the AI analysis (<code>ai</code> object). Omit for the deterministic report only.</td></tr>
          <tr><td><code>mode</code></td><td><span class="opt">optional</span></td><td>AI lens: <code>beginner</code> (default), <code>trader</code>, or <code>developer</code>.</td></tr>
        </table>

        <div class="cap">Example request</div>
        <pre><code>curl "https://rugcheck-asp.onrender.com/rugcheck?address=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&amp;chain=ethereum&amp;ai=1&amp;mode=beginner"</code></pre>

        <div class="cap">Example response (trimmed)</div>
        <pre><code>{
  "ok": true,
  "token": {
    "name": "USD Coin", "symbol": "USDC",
    "address": "0xa0b8…eb48", "chainIndex": "1",
    "logo": "https://…/usdc.png"
  },
  "market": {
    "priceUsd": 1, "liquidityUsd": 2118990968981.7,
    "marketCapUsd": 50285230401.6, "holders": 3222383,
    "priceChange24H": 0.04
  },
  "verdict": "OK",
  "score": 24,
  "headline": "Looks clean, minor notes.",
  "found": true,
  "riskLevel": "LOW",
  "chainSupported": true,
  "concerns": [ { "label": "Supply is mintable (owner can dilute)", "weight": "medium" } ],
  "positives": [ "No buy/sell tax", "Top 10 holders own 9.9%" ],
  "ai": {
    "executiveSummary": "USD Coin shows a strong security posture …",
    "verdictReason": "…",
    "confidence": 88,
    "risks": [ { "title": "Mintable supply", "tier": "minor",
                 "whatItMeans": "…", "whyItMatters": "…", "consequence": "…" } ],
    "scamPattern": "",
    "keyTakeaway": "…",
    "model": "anthropic/claude-opus-4.8"
  },
  "aiError": null,
  "aiAvailable": true,
  "disclaimer": "RugCheck reports factual on-chain data from OKX Onchain OS. It is not investment advice."
}</code></pre>
        <p>Without <code>ai=1</code>, the <code>ai</code> field is <code>null</code> and the deterministic
          report is returned in full — the AI layer is additive and never blocks a scan.</p>
      </section>

      <section id="mcp">
        <h2>MCP tool (A2MCP)</h2>
        <div class="route"><span class="verb post">POST</span><span class="path">/mcp</span></div>
        <p>RugCheck is also a <b>Model Context Protocol</b> server, so AI agents can call it as a tool. The
          transport is <b>Streamable HTTP</b>, operated statelessly: send a JSON-RPC 2.0 request with
          <code>Content-Type: application/json</code> and read the JSON-RPC response. This is the endpoint
          registered on the OKX.AI marketplace (A2MCP).</p>

        <h3>Methods</h3>
        <ul>
          <li><code>initialize</code> — handshake; returns protocol version + capabilities.</li>
          <li><code>tools/list</code> — lists the available tools.</li>
          <li><code>tools/call</code> — runs a tool.</li>
          <li><code>ping</code> — health check.</li>
        </ul>

        <h3>Tool: <code>rugcheck</code></h3>
        <table>
          <tr><th>Argument</th><th>Type</th><th>Description</th></tr>
          <tr><td><code>address</code></td><td>string <span class="req">required</span></td><td>Token contract address (EVM or Solana).</td></tr>
          <tr><td><code>chain</code></td><td>string</td><td>Default <code>ethereum</code>.</td></tr>
          <tr><td><code>include_ai</code></td><td>boolean</td><td>Include the AI explanation (default <code>true</code>).</td></tr>
          <tr><td><code>mode</code></td><td>string</td><td><code>beginner</code> | <code>trader</code> | <code>developer</code>.</td></tr>
        </table>
        <p>The result carries the report both as a text block (<code>content[0].text</code>, JSON) and as
          <code>structuredContent</code> for clients that support it.</p>

        <div class="cap">1 · initialize</div>
        <pre><code>curl -X POST https://rugcheck-asp.onrender.com/mcp \\
  -H "content-type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",
       "params":{"protocolVersion":"2025-06-18","capabilities":{},
                 "clientInfo":{"name":"my-agent","version":"1.0"}}}'</code></pre>

        <div class="cap">2 · tools/call</div>
        <pre><code>curl -X POST https://rugcheck-asp.onrender.com/mcp \\
  -H "content-type: application/json" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"rugcheck",
                 "arguments":{"address":"0x6982508145454Ce325dDbE47a25d4ec3d2311933",
                              "chain":"ethereum","include_ai":true,"mode":"trader"}}}'</code></pre>

        <div class="cap">Result shape</div>
        <pre><code>{
  "jsonrpc": "2.0", "id": 2,
  "result": {
    "content": [ { "type": "text", "text": "{ …the full report as JSON… }" } ],
    "structuredContent": { "verdict": "…", "score": 0, "token": { }, "ai": { } },
    "isError": false
  }
}</code></pre>
        <div class="note">Point any MCP client at <code>https://rugcheck-asp.onrender.com/mcp</code>. A bad
          address or unreachable token returns a tool result with <code>isError: true</code> and a plain
          message rather than a protocol error.</div>
      </section>

      <section id="utility">
        <h2>Utility endpoints</h2>
        <div class="route"><span class="verb get">GET</span><span class="path">/health</span></div>
        <pre><code>{ "ok": true, "service": "rugcheck" }</code></pre>
        <div class="route"><span class="verb get">GET</span><span class="path">/ai-status</span></div>
        <p>Reports whether the AI layer is enabled and which model backs it.</p>
        <pre><code>{ "enabled": true, "model": "anthropic/claude-opus-4.8" }</code></pre>
        <div class="route"><span class="verb post">POST</span><span class="path">/chat</span></div>
        <p>Conversational follow-up grounded in a report. Body: <code>{ report, messages, mode }</code>,
          where <code>messages</code> is an array of <code>{ role, content }</code>. Used by the web UI's
          chat and Explain features.</p>
      </section>

      <section id="response">
        <h2>Response fields</h2>
        <table>
          <tr><th>Field</th><th>Meaning</th></tr>
          <tr><td><code>verdict</code></td><td><code>OK</code> · <code>CAUTION</code> · <code>AVOID</code> · <code>UNKNOWN</code>. The overall call.</td></tr>
          <tr><td><code>score</code></td><td>0–100 <b>risk</b> score (higher = riskier). <code>null</code> when indeterminate.</td></tr>
          <tr><td><code>riskLevel</code></td><td>OKX's authoritative risk level (<code>LOW</code>/<code>MEDIUM</code>/<code>HIGH</code>/<code>CRITICAL</code>).</td></tr>
          <tr><td><code>found</code></td><td><code>false</code> when the token has no data on that chain (wrong chain / bad address) — treat as "check the address and chain".</td></tr>
          <tr><td><code>concerns[]</code></td><td>Risk flags, each <code>{ label, weight }</code> where weight is <code>critical</code> · <code>high</code> · <code>medium</code>.</td></tr>
          <tr><td><code>positives[]</code></td><td>Reassuring signals confirmed in the data.</td></tr>
          <tr><td><code>ai</code></td><td>AI analysis (only when <code>ai=1</code> / <code>include_ai</code>): <code>executiveSummary</code>, <code>verdictReason</code>, <code>confidence</code>, <code>risks[]</code> (tiered critical/important/minor), <code>scamPattern</code>, <code>keyTakeaway</code>, <code>model</code>.</td></tr>
        </table>
      </section>

      <section id="chains">
        <h2>Supported chains &amp; modes</h2>
        <h3>Chains</h3>
        <p>
          <span class="pill">ethereum</span><span class="pill">bsc</span><span class="pill">base</span>
          <span class="pill">arbitrum</span><span class="pill">polygon</span><span class="pill">optimism</span>
          <span class="pill">avalanche</span><span class="pill">solana</span>
        </p>
        <h3>Modes</h3>
        <ul>
          <li><b>beginner</b> — simple language and analogies.</li>
          <li><b>trader</b> — liquidity, whale concentration, market/exit risk.</li>
          <li><b>developer</b> — ownership, mint authority, verification, freeze authorities.</li>
        </ul>
        <p>Deep link into the web UI to auto-run a scan:
          <code>/?address=0x…&amp;chain=bsc&amp;mode=trader</code></p>
      </section>

      <section id="errors">
        <h2>Errors</h2>
        <p>Errors return <code>{ "ok": false, "error": "…" }</code> with an appropriate status:</p>
        <table>
          <tr><th>Status</th><th>When</th></tr>
          <tr><td><code>400</code></td><td>Missing or malformed <code>address</code>.</td></tr>
          <tr><td><code>502</code></td><td>Upstream OKX lookup failed.</td></tr>
          <tr><td><code>503</code></td><td><code>/chat</code> called while the AI layer is not configured.</td></tr>
        </table>
        <p>A valid token with no on-chain data is <b>not</b> an error — it returns <code>200</code> with
          <code>found: false</code> and an <code>UNKNOWN</code> verdict.</p>
      </section>
    </main>
  </div>

  <footer>Source: OKX Onchain OS · AI explanations by RugCheck · Not investment advice.</footer>
</body>
</html>`;
