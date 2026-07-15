// Demo web UI, inlined so the service is a single self-contained process.
// Design: a monochrome graphite "instrument console". The only vivid colour is
// the verdict itself and risk-tier severity — because on a safety scanner the
// colour IS the reading. The AI analyst layer is rendered as an annotated
// report beneath the deterministic instruments.
export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RugCheck · AI on-chain safety analyst</title>
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="apple-touch-icon" href="/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --ground:#0C0E13; --panel:#13161E; --panel-2:#191D27; --line:#262B36; --line-2:#333A48;
    --text:#EDEFF4; --muted:#A8AFBE; --faint:#767E8F;
    --safe:#35D6A4; --warn:#F2B84B; --danger:#FF5C7A; --unknown:#8B93A5;
    --signal:var(--unknown);
    --display:'Space Grotesk',system-ui,sans-serif;
    --body:'Inter',system-ui,sans-serif;
    --mono:'JetBrains Mono',ui-monospace,monospace;
    color-scheme: dark;
  }
  * { box-sizing:border-box; }
  svg { display:inline-block; vertical-align:middle; width:1em; height:1em; }
  html, body { margin:0; }
  body {
    font-family:var(--body); color:var(--text); background:var(--ground);
    min-height:100vh; line-height:1.55; -webkit-font-smoothing:antialiased;
    background-image:
      radial-gradient(120% 80% at 50% -10%, rgba(53,214,164,0.05), transparent 60%),
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size:100% 100%, 46px 46px, 46px 46px;
    background-position:0 0, -1px -1px, -1px -1px;
  }
  body::before { content:""; position:fixed; inset:0; pointer-events:none;
    background:radial-gradient(90% 70% at 50% 30%, transparent 55%, var(--ground) 100%); }
  .wrap { position:relative; max-width:720px; margin:0 auto; padding:40px 22px 72px; }

  header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
  .mark { width:38px; height:38px; flex:none; display:grid; place-items:center; overflow:hidden;
          border:1px solid var(--line-2); border-radius:10px; background:var(--panel);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.03); color:var(--text); }
  .mark svg { width:21px; height:21px; }
  .mark img { width:100%; height:100%; object-fit:cover; border-radius:9px; display:block; }
  .wordmark { font-family:var(--display); font-weight:700; font-size:21px; letter-spacing:-0.01em; }
  .wordmark b { color:var(--safe); font-weight:700; }
  .eyebrow { font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--faint); }

  .lede { color:#C2C8D4; font-size:15px; line-height:1.7; max-width:46ch; margin:18px 0 4px; font-weight:400; }
  .lede b { color:var(--text); font-weight:500; }
  .checks { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 24px; }
  .chip { font-family:var(--mono); font-size:11.5px; letter-spacing:0.04em; color:var(--muted);
          border:1px solid var(--line); border-radius:999px; padding:6px 11px; display:inline-flex;
          align-items:center; gap:7px; background:var(--panel); }
  .chip svg { width:13px; height:13px; color:var(--faint); }

  .console { border:1px solid var(--line-2); border-radius:16px;
             background:linear-gradient(180deg, var(--panel-2), var(--panel));
             padding:16px; box-shadow:0 24px 60px -30px rgba(0,0,0,0.8); }
  .console-top { display:flex; align-items:center; justify-content:space-between; gap:12px;
                 margin:2px 4px 12px; }
  .console-label { font-family:var(--mono); font-size:11px; letter-spacing:0.14em;
                   text-transform:uppercase; color:var(--faint); }
  .modes { display:inline-flex; border:1px solid var(--line-2); border-radius:9px; overflow:hidden; }
  .modes button { font:inherit; font-family:var(--mono); font-size:11px; letter-spacing:0.06em;
                  text-transform:uppercase; color:var(--muted); background:transparent; border:0;
                  padding:7px 11px; cursor:pointer; border-left:1px solid var(--line-2); }
  .modes button:first-child { border-left:0; }
  .modes button[aria-pressed="true"] { background:var(--panel-2); color:var(--text); }
  form { display:flex; gap:10px; flex-wrap:wrap; }
  .field { flex:1 1 260px; display:flex; align-items:center; gap:10px; background:var(--ground);
           border:1px solid var(--line-2); border-radius:11px; padding:0 13px; }
  .field svg { width:17px; height:17px; color:var(--faint); flex:none; }
  input, select, button { font:inherit; color:var(--text); background:transparent; border:0; }
  input { width:100%; padding:14px 0; font-family:var(--mono); font-size:14px; }
  input::placeholder { color:var(--faint); }
  select { background:var(--ground); border:1px solid var(--line-2); border-radius:11px;
           padding:0 34px 0 14px; font-family:var(--mono); font-size:13px; cursor:pointer; appearance:none;
           background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23767E8F' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
           background-repeat:no-repeat; background-position:right 11px center; }
  button.go { background:var(--text); color:var(--ground); font-family:var(--display); font-weight:600;
              border-radius:11px; padding:14px 22px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
              transition:transform .08s ease, opacity .15s ease; }
  button.go svg { width:16px; height:16px; }
  button.go:hover { transform:translateY(-1px); }
  button.go:disabled { opacity:.5; cursor:progress; transform:none; }
  :focus-visible { outline:2px solid var(--safe); outline-offset:2px; border-radius:8px; }

  #out { margin-top:20px; }
  .scanning { border:1px solid var(--line); border-radius:16px; background:var(--panel);
              padding:26px; display:flex; align-items:center; gap:16px; color:var(--muted);
              font-family:var(--mono); font-size:13px; letter-spacing:0.06em; }
  .sweep { width:22px; height:22px; border-radius:50%; border:2px solid var(--line-2);
           border-top-color:var(--safe); animation:spin 0.7s linear infinite; flex:none; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .readout { border:1px solid var(--line-2); border-radius:16px; overflow:hidden;
             box-shadow:0 24px 60px -30px rgba(0,0,0,0.8); }
  .verdict { display:flex; gap:22px; align-items:center; padding:24px 22px;
             background:radial-gradient(90% 140% at 0% 0%, color-mix(in srgb, var(--signal) 12%, transparent), transparent 60%),
               linear-gradient(180deg, var(--panel-2), var(--panel));
             border-bottom:1px solid var(--line); }
  .dial { position:relative; width:118px; height:118px; flex:none; }
  .dial canvas { width:118px; height:118px; display:block; }
  .dial .num { position:absolute; inset:0; display:grid; place-content:center; text-align:center; }
  .dial .num b { font-family:var(--display); font-weight:700; font-size:30px; color:var(--signal); line-height:1; }
  .dial .num span { font-family:var(--mono); font-size:9.5px; letter-spacing:0.18em; color:var(--faint);
                    text-transform:uppercase; display:block; margin-top:3px; }
  .vmeta { min-width:0; }
  .badge { display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:11px;
           letter-spacing:0.1em; text-transform:uppercase; color:var(--signal);
           border:1px solid color-mix(in srgb, var(--signal) 40%, var(--line)); border-radius:999px;
           padding:5px 11px; background:color-mix(in srgb, var(--signal) 9%, transparent); }
  .badge svg { width:13px; height:13px; }
  .headline { font-family:var(--display); font-weight:700; font-size:25px; letter-spacing:-0.01em; margin:12px 0 6px; }
  .ident { font-size:14px; color:var(--muted); }
  .ident .sym { color:var(--text); font-weight:500; }
  .addr { font-family:var(--mono); font-size:12px; color:var(--faint); margin-top:5px;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .metrics { display:grid; grid-template-columns:repeat(4,1fr); background:var(--line); gap:1px; border-bottom:1px solid var(--line); }
  .metric { background:var(--panel); padding:15px 16px; }
  .metric .k { font-family:var(--mono); font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase;
               color:var(--faint); display:flex; align-items:center; gap:6px; }
  .metric .k svg { width:12px; height:12px; }
  .metric .v { font-family:var(--display); font-weight:600; font-size:19px; margin-top:8px; }

  /* AI analyst section */
  .ai { border-bottom:1px solid var(--line); }
  .ai-head { display:flex; align-items:center; gap:9px; padding:16px 20px 4px;
             font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--faint); }
  .ai-head .spark { color:var(--safe); }
  .ai-head .model { margin-left:auto; text-transform:none; letter-spacing:0.02em; }
  .summary { padding:6px 20px 16px; font-size:15px; line-height:1.65; color:var(--text); }
  .aichips { display:flex; gap:10px; flex-wrap:wrap; padding:0 20px 16px; }
  .stat { border:1px solid var(--line); border-radius:11px; padding:10px 14px; background:var(--panel-2); min-width:120px; }
  .stat .l { font-family:var(--mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--faint); }
  .stat .n { font-family:var(--display); font-weight:700; font-size:22px; margin-top:3px; }
  .stat .n small { font-size:12px; color:var(--faint); font-weight:500; }
  .why { padding:0 20px 18px; color:var(--muted); font-size:14px; line-height:1.6; }
  .why b { color:var(--text); font-weight:500; }

  .scam { margin:0 20px 18px; border:1px solid color-mix(in srgb, var(--warn) 45%, var(--line));
          background:color-mix(in srgb, var(--warn) 9%, var(--panel)); border-radius:12px; padding:13px 15px;
          display:flex; gap:11px; font-size:13.5px; line-height:1.55; color:var(--text); }
  .scam svg { width:17px; height:17px; color:var(--warn); flex:none; margin-top:2px; }

  .tiers { padding:0 20px 6px; display:flex; flex-direction:column; gap:12px; }
  .tier-label { font-family:var(--mono); font-size:10.5px; letter-spacing:0.12em; text-transform:uppercase;
                color:var(--faint); margin:8px 0 -4px; }
  .risk { border:1px solid var(--line); border-left-width:3px; border-radius:11px; background:var(--panel-2); padding:13px 15px; }
  .risk.critical { border-left-color:var(--danger); }
  .risk.important { border-left-color:var(--warn); }
  .risk.minor { border-left-color:var(--muted); }
  .risk h4 { margin:0 0 7px; font-family:var(--display); font-size:15px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .risk .pill { font-family:var(--mono); font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase;
                border-radius:999px; padding:2px 8px; }
  .risk.critical .pill { color:var(--danger); background:color-mix(in srgb, var(--danger) 12%, transparent); }
  .risk.important .pill { color:var(--warn); background:color-mix(in srgb, var(--warn) 12%, transparent); }
  .risk.minor .pill { color:var(--muted); background:color-mix(in srgb, var(--muted) 12%, transparent); }
  .risk dl { margin:0; display:grid; grid-template-columns:auto 1fr; gap:4px 10px; font-size:13px; }
  .risk dt { font-family:var(--mono); font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--faint); padding-top:2px; }
  .risk dd { margin:0; color:var(--text); line-height:1.5; }

  .takeaway { margin:14px 20px 4px; padding:13px 15px; border-radius:12px; background:var(--panel-2);
              border:1px solid var(--line); font-size:14px; line-height:1.55; display:flex; gap:11px; }
  .takeaway svg { width:16px; height:16px; color:var(--safe); flex:none; margin-top:2px; }
  .takeaway b { color:var(--text); }

  .cols { display:grid; grid-template-columns:1fr 1fr; background:var(--line); gap:1px; }
  .col { background:var(--panel); padding:18px; }
  .col h3 { font-family:var(--mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; margin:0 0 14px;
            display:flex; align-items:center; gap:8px; }
  .col h3 svg { width:14px; height:14px; flex:none; }
  .col.flags h3 { color:var(--danger); } .col.clear h3 { color:var(--safe); }
  .col ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
  .col li { display:flex; gap:9px; font-size:13.5px; color:var(--text); align-items:flex-start; }
  .col li svg { width:15px; height:15px; flex:none; margin-top:2.5px; }
  .col.flags li svg { color:var(--danger); } .col.clear li svg { color:var(--safe); }
  .col .none { color:var(--faint); font-size:13px; }

  .foot { color:var(--faint); font-size:12px; padding:14px 20px; background:var(--panel);
          font-family:var(--mono); letter-spacing:0.02em; border-top:1px solid var(--line); }
  .foot .aioff { color:var(--faint); }

  /* Chat */
  .chat { margin-top:16px; border:1px solid var(--line-2); border-radius:16px; background:var(--panel); overflow:hidden; }
  .chat-head { padding:13px 18px; border-bottom:1px solid var(--line); font-family:var(--mono); font-size:11px;
               letter-spacing:0.12em; text-transform:uppercase; color:var(--faint); display:flex; align-items:center; gap:8px; }
  .chat-head .spark { color:var(--safe); }
  .chat-log { padding:16px 18px; display:flex; flex-direction:column; gap:12px; max-height:340px; overflow-y:auto; }
  .msg { font-size:14px; line-height:1.55; max-width:88%; }
  .msg.user { align-self:flex-end; background:var(--panel-2); border:1px solid var(--line-2); color:var(--text);
              border-radius:12px 12px 3px 12px; padding:10px 13px; }
  .msg.bot { align-self:flex-start; color:var(--text); }
  .msg.bot .who { font-family:var(--mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--safe); margin-bottom:4px; }
  .msg.bot p { margin:0 0 8px; } .msg.bot p:last-child { margin-bottom:0; }
  .msg.bot ul, .msg.bot ol { margin:6px 0 8px; padding-left:20px; display:flex; flex-direction:column; gap:5px; }
  .msg.bot li { line-height:1.5; }
  .msg.bot strong { color:var(--text); font-weight:600; }
  .msg.bot code { font-family:var(--mono); font-size:12.5px; background:var(--panel-2);
                  border:1px solid var(--line); border-radius:5px; padding:1px 5px; }
  .suggest { display:flex; flex-wrap:wrap; gap:7px; padding:0 18px 14px; }
  .suggest button { font:inherit; font-family:var(--mono); font-size:11.5px; color:var(--muted);
                    border:1px solid var(--line-2); background:var(--panel-2); border-radius:999px; padding:6px 11px; cursor:pointer; }
  .chat-form { display:flex; gap:9px; padding:14px 18px; border-top:1px solid var(--line); }
  .chat-form input { background:var(--ground); border:1px solid var(--line-2); border-radius:11px; padding:12px 13px; font-family:var(--body); }
  .chat-form button { background:var(--text); color:var(--ground); font-weight:600; border-radius:11px; padding:0 18px; cursor:pointer; font-family:var(--display); }
  .chat-form button:disabled { opacity:.5; cursor:progress; }

  .disclaimer { color:var(--faint); font-size:11.5px; text-align:center; margin-top:26px; font-family:var(--mono); letter-spacing:0.03em; }
  .err { border:1px solid color-mix(in srgb, var(--danger) 45%, var(--line)); color:var(--danger); border-radius:14px;
         padding:18px 20px; background:color-mix(in srgb, var(--danger) 8%, var(--panel)); font-size:14px; }

  /* Explain This — inline AI explanations grounded in the current report */
  .ex-group { display:flex; flex-direction:column; gap:1px; background:var(--line); border-bottom:1px solid var(--line); }
  .ex-grp-head { display:flex; align-items:center; gap:9px; padding:14px 20px; background:var(--panel);
                 font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--faint); }
  .ex-grp-head svg { width:14px; height:14px; color:var(--safe); }
  .ex-item { background:var(--panel); }
  .ex-item.mini { background:transparent; }
  .ex-inset { padding:0 20px 16px; background:var(--panel); }
  .ex-btn { width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; font:inherit;
            background:transparent; border:0; cursor:pointer; padding:13px 20px; color:var(--text); text-align:left; }
  .ex-item.mini .ex-btn { width:auto; padding:5px 11px; border:1px solid var(--line-2); border-radius:999px; background:var(--panel-2); }
  .ex-l { font-size:13.5px; color:var(--muted); font-family:var(--mono); letter-spacing:0.02em; min-width:0;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ex-cta { display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:11px; letter-spacing:0.08em;
            text-transform:uppercase; color:var(--safe); flex:none; }
  .ex-cta svg { width:13px; height:13px; }
  .ex-cta .chev { transition:transform .25s ease; color:var(--faint); }
  .ex-btn[aria-expanded="true"] .ex-cta .chev { transform:rotate(180deg); }
  .ex-body { display:grid; grid-template-rows:0fr; transition:grid-template-rows .28s ease; }
  .ex-body.open { grid-template-rows:1fr; }
  .ex-inner { overflow:hidden; }
  .ex-card { margin:0 20px 16px; padding:13px 15px; border:1px solid var(--line); border-left:3px solid var(--safe);
             border-radius:11px; background:var(--panel-2); font-size:13.5px; line-height:1.6; color:var(--text); }
  .ex-item.mini .ex-card { margin:9px 0 2px; }
  .ex-card.err-card { border-left-color:var(--danger); color:var(--danger); }
  .ex-card p { margin:0 0 7px; } .ex-card p:last-child { margin-bottom:0; }
  .ex-card strong { color:var(--text); font-weight:600; }
  .ex-card.loading { display:flex; align-items:center; gap:10px; color:var(--muted); font-family:var(--mono);
                     font-size:12px; letter-spacing:0.05em; }
  .ex-spin { width:15px; height:15px; border-radius:50%; border:2px solid var(--line-2); border-top-color:var(--safe);
             animation:spin .7s linear infinite; flex:none; }
  /* per-flag explain sits under the flag label */
  .col li.flag-li { flex-direction:column; align-items:stretch; gap:8px; }
  .flag-row { display:flex; gap:9px; align-items:flex-start; }
  .flag-li .ex-cta svg { width:13px; height:13px; margin-top:0; color:var(--safe); }
  .flag-li .ex-cta .chev { color:var(--faint); }

  /* Share result card */
  .result-actions { display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; background:var(--panel); border-top:1px solid var(--line); }
  .share-btn, .share-x-btn { display:inline-flex; align-items:center; gap:8px; font-family:var(--display); font-weight:600; font-size:14px;
               border-radius:11px; padding:11px 18px; cursor:pointer; transition:transform .08s ease; }
  .share-btn { color:var(--ground); background:var(--safe); border:0; }
  .share-x-btn { color:#fff; background:#000; border:1px solid var(--line-2); }
  .share-btn svg, .share-x-btn svg { width:16px; height:16px; }
  .share-btn:hover, .share-x-btn:hover { transform:translateY(-1px); }
  .share-actions .sa-x { background:#000; color:#fff; border-color:#000; }
  .share-overlay { position:fixed; inset:0; background:rgba(6,8,12,0.82); z-index:50; display:grid; place-items:center;
                   padding:20px; overflow:auto; animation:fade .18s ease; }
  @keyframes fade { from { opacity:0; } to { opacity:1; } }
  .share-modal { width:100%; max-width:600px; background:var(--panel); border:1px solid var(--line-2); border-radius:18px;
                 overflow:hidden; box-shadow:0 40px 100px -30px rgba(0,0,0,0.9); }
  .share-modal-head { display:flex; align-items:center; justify-content:space-between; padding:15px 18px; border-bottom:1px solid var(--line);
                      font-family:var(--mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--faint); }
  .share-close { background:transparent; border:0; color:var(--muted); cursor:pointer; padding:4px; display:grid; place-items:center; }
  .share-close svg { width:18px; height:18px; }
  .share-canvas-wrap { padding:18px; background:var(--ground); }
  .share-canvas-wrap canvas { width:100%; height:auto; display:block; border-radius:12px; border:1px solid var(--line); }
  .share-actions { display:flex; gap:10px; padding:16px 18px; flex-wrap:wrap; }
  .share-actions button { flex:1 1 130px; display:inline-flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;
                          font-family:var(--display); font-weight:600; font-size:13.5px; padding:11px 14px; border-radius:11px;
                          border:1px solid var(--line-2); background:var(--panel-2); color:var(--text); }
  .share-actions .sa-primary { background:var(--text); color:var(--ground); border-color:var(--text); }
  .share-actions button svg { width:15px; height:15px; }
  .share-note { padding:0 18px 16px; font-family:var(--mono); font-size:12px; color:var(--muted); }
  .share-note:empty { display:none; }

  /* Empty state — example tokens */
  .empty { border:1px solid var(--line); border-radius:16px; background:var(--panel); padding:24px 22px; }
  .empty-head { font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--faint); margin-bottom:14px; }
  .example-tokens { display:flex; gap:10px; flex-wrap:wrap; }
  .ex-token { display:flex; flex-direction:column; gap:3px; align-items:flex-start; text-align:left; cursor:pointer; font:inherit;
              background:var(--panel-2); border:1px solid var(--line-2); border-radius:12px; padding:12px 14px; min-width:132px; color:var(--text);
              transition:transform .08s ease, border-color .15s ease; }
  .ex-token:hover { transform:translateY(-1px); border-color:var(--faint); }
  .ex-token-sym { font-family:var(--display); font-weight:600; font-size:15px; }
  .ex-token-sub { font-size:12px; color:var(--muted); }
  .empty-note { color:var(--faint); font-size:13px; margin:16px 0 0; }

  /* Recent scans */
  #recent { margin-top:16px; }
  #recent:empty { display:none; }
  .recent-head { font-family:var(--mono); font-size:10.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--faint); margin-bottom:8px; }
  .recent-row { display:flex; gap:8px; flex-wrap:wrap; }
  .recent-chip { display:inline-flex; align-items:center; gap:7px; cursor:pointer; font:inherit; color:var(--text);
                 background:var(--panel); border:1px solid var(--line-2); border-radius:999px; padding:6px 12px;
                 font-family:var(--mono); font-size:12px; }
  .recent-chip:hover { border-color:var(--faint); }
  .recent-chip img { width:15px; height:15px; border-radius:50%; }
  .rc-dot { width:8px; height:8px; border-radius:50%; flex:none; }

  /* Address actions + verified line */
  .addr { display:flex; align-items:center; gap:8px; }
  .addr .addr-txt { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .copy-addr, .addr-link { display:inline-grid; place-items:center; width:24px; height:24px; flex:none; padding:0; cursor:pointer;
                           background:transparent; border:1px solid var(--line); border-radius:7px; color:var(--faint); }
  .copy-addr:hover, .addr-link:hover { color:var(--text); border-color:var(--line-2); }
  .copy-addr svg, .addr-link svg { width:13px; height:13px; }
  .verified { display:flex; align-items:center; gap:6px; font-family:var(--mono); font-size:11px; color:var(--faint); margin-top:8px; }
  .verified svg { width:12px; height:12px; color:var(--safe); }

  /* Skeleton loading */
  .sk { background:var(--panel-2); border-radius:6px; position:relative; overflow:hidden; }
  .sk::after { content:""; position:absolute; inset:0; transform:translateX(-100%);
               background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--text) 7%, transparent), transparent);
               animation:shimmer 1.3s infinite; }
  @keyframes shimmer { 100% { transform:translateX(100%); } }
  .sk-bar { height:12px; margin:9px 0; }
  .sk-dial { width:118px; height:118px; border-radius:50%; flex:none; }
  .sk-status { color:var(--faint); font-size:13px; padding:14px 20px; background:var(--panel); font-family:var(--mono);
               letter-spacing:0.04em; border-top:1px solid var(--line); display:flex; align-items:center; gap:14px; }

  /* Toasts */
  #toasts { position:fixed; top:16px; right:16px; z-index:60; display:flex; flex-direction:column; gap:8px; }
  .toast { background:var(--panel-2); border:1px solid var(--line-2); color:var(--text); font-family:var(--mono); font-size:12.5px;
           padding:10px 14px; border-radius:11px; box-shadow:0 20px 40px -20px rgba(0,0,0,0.8);
           opacity:0; transform:translateY(-8px); transition:opacity .25s ease, transform .25s ease; }
  .toast.show { opacity:1; transform:none; }

  @media (max-width:560px) {
    .metrics { grid-template-columns:repeat(2,1fr); }
    .verdict { flex-direction:column; align-items:flex-start; }
    .console-top { flex-direction:column; align-items:flex-start; }
    .result-actions { flex-direction:column; }
    .share-btn, .share-x-btn { width:100%; justify-content:center; }
    .ex-token { flex:1 1 100%; }
    #toasts { left:16px; right:16px; }
  }
  @media (prefers-reduced-motion:reduce) { .sweep { animation:none; } button.go:hover { transform:none; } .sk::after { animation:none; } .toast { transition:opacity .25s ease; transform:none; } }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="mark">
        <img src="/logo.png" alt="RugCheck logo" width="38" height="38" />
      </div>
      <div>
        <div class="wordmark">Rug<b>Check</b></div>
        <div class="eyebrow">AI on-chain safety analyst</div>
      </div>
    </header>

    <p class="lede">Paste any token contract. RugCheck reads it against OKX on-chain security data,
      then an AI analyst <b>explains what it found in plain English</b>: safe, shaky, or a trap.</p>

    <div class="checks">
      <span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>Honeypot &amp; sell traps</span>
      <span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z"/></svg>Liquidity depth</span>
      <span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 6M17 15c2.5.4 4 2.3 4 5"/></svg>Holder concentration</span>
    </div>

    <div class="console">
      <div class="console-top">
        <span class="console-label">Contract input</span>
        <div class="modes" id="modes" role="group" aria-label="Explanation mode">
          <button type="button" data-mode="beginner" aria-pressed="true">Beginner</button>
          <button type="button" data-mode="trader" aria-pressed="false">Trader</button>
          <button type="button" data-mode="developer" aria-pressed="false">Developer</button>
        </div>
      </div>
      <form id="f">
        <label class="field" style="flex:1 1 260px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="addr" placeholder="0x… or Solana address" autocomplete="off" spellcheck="false" aria-label="Token contract address" />
        </label>
        <select id="chain" aria-label="Chain">
          <option value="ethereum">Ethereum</option>
          <option value="bsc">BSC</option>
          <option value="base">Base</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="polygon">Polygon</option>
          <option value="solana">Solana</option>
        </select>
        <button class="go" id="go" type="submit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13M12 5l7 7-7 7"/></svg>
          Scan
        </button>
      </form>
    </div>

    <div id="recent"></div>
    <div id="out" aria-live="polite"></div>
    <div id="chatMount"></div>
    <p class="disclaimer">Factual on-chain data plus AI explanation. Not investment advice. Always do your own research.</p>
  </div>

<script>
var f = document.getElementById('f'), out = document.getElementById('out'), go = document.getElementById('go');
var chatMount = document.getElementById('chatMount');
var modeBox = document.getElementById('modes');
var mode = 'beginner';
var aiAvailable = false;
var current = null; // { report, chain }

var COLOR = { OK:'#35D6A4', CAUTION:'#F2B84B', AVOID:'#FF5C7A', UNKNOWN:'#8B93A5' };
var VBADGE = { OK:'Cleared', CAUTION:'Flagged', AVOID:'Danger', UNKNOWN:'Unknown' };
var ICON = {
  ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  price:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  liq:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z"/></svg>',
  cap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  holders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 6M17 15c2.5.4 4 2.3 4 5"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 14v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 20h14"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/></svg>',
  external:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
};

// mode toggle
modeBox.addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  mode = b.getAttribute('data-mode');
  [].forEach.call(modeBox.querySelectorAll('button'), function(x){ x.setAttribute('aria-pressed', x===b ? 'true':'false'); });
  if(current && document.getElementById('addr').value.trim()) f.requestSubmit(); // re-run in new mode
});

fetch('/ai-status').then(function(r){return r.json();}).then(function(s){ aiAvailable = !!s.enabled; }).catch(function(){});

var CHAIN_NAME = { ethereum:'Ethereum', eth:'Ethereum', bsc:'BSC', bnb:'BSC', base:'Base', arbitrum:'Arbitrum', polygon:'Polygon', optimism:'Optimism', avalanche:'Avalanche', solana:'Solana', sol:'Solana' };
var EXPLORER = { ethereum:'https://etherscan.io/token/', eth:'https://etherscan.io/token/', bsc:'https://bscscan.com/token/', bnb:'https://bscscan.com/token/', base:'https://basescan.org/token/', arbitrum:'https://arbiscan.io/token/', polygon:'https://polygonscan.com/token/', optimism:'https://optimistic.etherscan.io/token/', avalanche:'https://snowtrace.io/token/', solana:'https://solscan.io/token/', sol:'https://solscan.io/token/' };
// Real mainnet tokens for the empty-state examples; verdicts are computed live.
var EXAMPLES = [
  { label:'USDC', sub:'Blue-chip stablecoin', address:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain:'ethereum' },
  { label:'PEPE', sub:'Popular meme coin', address:'0x6982508145454Ce325dDbE47a25d4ec3d2311933', chain:'ethereum' },
  { label:'SHIB', sub:'Meme coin', address:'0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', chain:'ethereum' }
];

// Explain-This cache: field key -> answer text. Cleared on each new scan so a
// re-opened explanation never triggers a second AI call, but a fresh scan does.
var explainCache = {};

// One delegated listener on the (stable) results container handles every
// Explain toggle and the Share button, across re-renders.
out.addEventListener('click', function(e){
  var et = e.target.closest('.ex-token');
  if(et){ runScan(et.getAttribute('data-addr'), et.getAttribute('data-chain')); return; }
  var ca = e.target.closest('.copy-addr');
  if(ca){ copyText(ca.getAttribute('data-addr'), 'Address copied'); return; }
  if(e.target.closest('.share-x-btn')){ if(current) shareToX(current.report, toast); return; }
  if(e.target.closest('.share-btn')){ openShareCard(); return; }
  var btn = e.target.closest('.ex-btn');
  if(btn) toggleExplain(btn);
});

// Recent-scans row (separate stable element) — click to re-run a past scan.
document.getElementById('recent').addEventListener('click', function(e){
  var b = e.target.closest('.recent-chip'); if(!b) return;
  runScan(b.getAttribute('data-addr'), b.getAttribute('data-chain'));
});
renderRecent();

f.addEventListener('submit', function(e){
  e.preventDefault();
  var address = document.getElementById('addr').value.trim();
  var chain = document.getElementById('chain').value;
  if(!address) return;
  go.disabled = true; chatMount.innerHTML = '';
  out.innerHTML = skeletonHTML(chain, aiAvailable);
  var u = '/rugcheck?address=' + encodeURIComponent(address) + '&chain=' + chain + '&ai=1&mode=' + mode;
  fetch(u).then(function(r){return r.json();}).then(function(d){
    if(!d.ok){ out.innerHTML = '<div class="err">' + esc(d.error) + '</div>'; return; }
    current = { report: d, chain: chain };
    explainCache = {};
    out.innerHTML = render(d);
    drawDial(d);
    if(d.ai) mountChat();
    pushRecent(d, chain);
  }).catch(function(err){
    out.innerHTML = '<div class="err">Could not reach the scanner. ' + esc(err.message) + '</div>';
  }).then(function(){ go.disabled = false; });
});

function esc(s){ return String(s==null?'':s).replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }
function money(n){ if(n==null) return '—'; if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B'; if(n>=1e6) return '$'+(n/1e6).toFixed(2)+'M'; if(n>=1e3) return '$'+(n/1e3).toFixed(1)+'K'; return '$'+Number(n).toLocaleString(); }
function price(n){ if(n==null) return '—'; if(n<0.01) return '$'+Number(n).toPrecision(2); return '$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:4}); }
function countv(n){ return n==null ? '—' : Number(n).toLocaleString(); }
function short(a){ return a && a.length>16 ? a.slice(0,10)+'…'+a.slice(-8) : (a||'—'); }

function render(d){
  // No token data (wrong chain / bad address): show a plain message, not a fake reading.
  if(d.found===false){
    return '<div class="readout" style="--signal:'+(COLOR.UNKNOWN)+'">'
      + '<div class="vmeta">'
      +   '<span class="badge">'+ICON.shield+VBADGE.UNKNOWN+'</span>'
      +   '<div class="headline">'+esc(d.headline)+'</div>'
      +   '<div class="addr">'+esc(short(d.token.address))+'</div>'
      + '</div>'
      + '<div class="foot">Source: OKX Onchain OS · token report</div></div>';
  }
  var c = COLOR[d.verdict] || COLOR.UNKNOWN;
  var scoreTxt = d.score==null ? '—' : d.score;
  var safety = d.score==null ? null : Math.max(0, 100 - d.score);
  var html = '<div class="readout" style="--signal:'+c+'">'
    + '<div class="verdict">'
    +   '<div class="dial"><canvas id="dial" width="236" height="236"></canvas><div class="num"><b>'+scoreTxt+'</b><span>Risk</span></div></div>'
    +   '<div class="vmeta">'
    +     '<span class="badge">'+ICON.shield+VBADGE[d.verdict]+'</span>'
    +     '<div class="headline">'+esc(d.headline)+'</div>'
    +     '<div class="ident"><span class="sym">'+esc(d.token.symbol||'?')+'</span> · '+esc(d.token.name||'Unknown token')+' · OKX risk '+esc(d.riskLevel)+'</div>'
    +     addrLine(d)
    +     '<div class="verified">'+ICON.ok+'Scanned '+esc(nowUTC())+' · RugCheck</div>'
    +   '</div>'
    + '</div>'
    + '<div class="metrics">'
    +   metric(ICON.price,'Price', price(d.market.priceUsd))
    +   metric(ICON.liq,'Liquidity', money(d.market.liquidityUsd))
    +   metric(ICON.cap,'Market cap', money(d.market.marketCapUsd))
    +   metric(ICON.holders,'Holders', countv(d.market.holders))
    + '</div>';

  if(d.ai) html += renderAI(d);
  if(d.ai) html += renderExplainGroup(d, safety);
  html += renderColumns(d);
  html += '<div class="result-actions">'
    + '<button type="button" class="share-x-btn">'+ICON.x+'Post on X</button>'
    + '<button type="button" class="share-btn">'+ICON.share+'Share result card</button>'
    + '</div>';

  var footNote = 'Source: OKX Onchain OS · token report';
  if(d.ai) footNote += ' · AI: ' + esc(d.ai.model || 'on');
  else if(d.aiError) footNote += ' · <span class="aioff">AI analysis unavailable this run</span>';
  else if(!d.aiAvailable) footNote += ' · <span class="aioff">AI disabled (set OPENROUTER_API_KEY)</span>';
  html += '<div class="foot">'+footNote+'</div></div>';
  return html;
}

// The "Explain any signal" accordion — one grounded, cached AI explanation per
// always-present reading (verdict / score / risk level / liquidity / holders).
function renderExplainGroup(d, safety){
  var scoreLbl = d.score==null ? '—/100' : d.score+'/100';
  var scoreQ = d.score==null ? 'unknown' : d.score+' out of 100 (higher means riskier)';
  var items =
      exItem('verdict', 'Overall verdict — '+d.verdict,
        'Explain why the overall verdict is "'+d.verdict+'" for this token, using only the current report. Keep it to 2-5 sentences.')
    + exItem('score', 'Risk score — '+scoreLbl,
        'Explain what a risk score of '+scoreQ+' means for this token, using only the current report. 2-5 sentences.')
    + exItem('risk', 'OKX risk level — '+d.riskLevel,
        'Explain what the OKX risk level "'+d.riskLevel+'" means for this token, using only the current report. 2-5 sentences.')
    + exItem('liquidity', 'Liquidity — '+money(d.market.liquidityUsd),
        'Explain what this liquidity level means for safety and how easy it would be to exit, using only the current report. 2-5 sentences.')
    + exItem('holders', 'Holders — '+countv(d.market.holders),
        'Explain what the holder distribution and concentration mean for safety, using only the current report. 2-5 sentences.');
  return '<div class="ex-group"><div class="ex-grp-head">'+ICON.spark+'Explain any signal</div>'+items+'</div>';
}
function metric(icon,k,v){ return '<div class="metric"><div class="k">'+icon+k+'</div><div class="v">'+esc(v)+'</div></div>'; }
// Address row with a copy button and an explorer link (chain-aware).
function addrLine(d){
  var addr = d.token.address || '';
  var exp = (EXPLORER[(current&&current.chain)||''] || '') + encodeURIComponent(addr);
  return '<div class="addr"><span class="addr-txt">'+esc(short(addr))+'</span>'
    + '<button type="button" class="copy-addr" data-addr="'+escA(addr)+'" title="Copy address" aria-label="Copy address">'+ICON.copy+'</button>'
    + (exp && addr ? '<a class="addr-link" href="'+escA(exp)+'" target="_blank" rel="noopener noreferrer" title="View on explorer" aria-label="View on explorer">'+ICON.external+'</a>' : '')
    + '</div>';
}

function renderAI(d){
  var ai = d.ai;
  var safety = d.score==null ? null : Math.max(0, 100 - d.score);
  var h = '<div class="ai">'
    + '<div class="ai-head"><span class="spark">'+ICON.spark+'</span>AI analyst <span class="model">'+esc(ai.model||'')+'</span></div>'
    + '<div class="summary">'+fmt(ai.executiveSummary)+'</div>'
    + '<div class="aichips">'
    +   '<div class="stat"><div class="l">Safety score</div><div class="n">'+(safety==null?'—':safety)+'<small>/100</small></div></div>'
    +   '<div class="stat"><div class="l">AI confidence</div><div class="n">'+ai.confidence+'<small>%</small></div></div>'
    + '</div>';
  if(ai.verdictReason) h += '<div class="why"><b>Why this verdict:</b> '+fmt(ai.verdictReason)+'</div>';
  if(ai.scamPattern){
    h += '<div class="scam">'+ICON.flag+'<div><b>Pattern watch.</b> '+fmt(ai.scamPattern)+'</div></div>';
    h += '<div class="ex-inset">'+exMini('scam',
        'Explain this potential risk pattern in plain terms: "'+String(ai.scamPattern).replace(/"/g,'')+'". Frame it as a pattern, not an accusation, using only the current report. 2-5 sentences.')+'</div>';
  }

  if(ai.risks && ai.risks.length){
    h += '<div class="tiers">';
    ['critical','important','minor'].forEach(function(tier){
      var group = ai.risks.filter(function(r){ return r.tier===tier; });
      if(!group.length) return;
      h += '<div class="tier-label">'+tier+'</div>';
      group.forEach(function(r){
        h += '<div class="risk '+tier+'"><h4><span class="pill">'+tier+'</span>'+fmt(r.title)+'</h4>'
          + '<dl>'
          + '<dt>Means</dt><dd>'+fmt(r.whatItMeans)+'</dd>'
          + '<dt>Matters</dt><dd>'+fmt(r.whyItMatters)+'</dd>'
          + '<dt>Risk</dt><dd>'+fmt(r.consequence)+'</dd>'
          + '</dl></div>';
      });
    });
    h += '</div>';
  }
  if(ai.keyTakeaway) h += '<div class="takeaway">'+ICON.bulb+'<div><b>Takeaway.</b> '+fmt(ai.keyTakeaway)+'</div></div>';
  h += '<div style="height:6px"></div></div>';
  return h;
}

function renderColumns(d){
  var flags = (d.concerns||[]).map(function(x,i){
    var row = ICON.flag+'<span>'+esc(x.label)+'</span>';
    if(!d.ai) return '<li>'+row+'</li>';
    var q = 'Explain this security finding: "'+String(x.label).replace(/"/g,'')+'". Why was it flagged and why does it matter for this token? Use only the current report. 2-5 sentences.';
    return '<li class="flag-li"><div class="flag-row">'+row+'</div>'+exMini('flag'+i, q)+'</li>';
  }).join('') || '<div class="none">No risk flags raised.</div>';
  var clear = (d.positives||[]).map(function(x){ return '<li>'+ICON.ok+'<span>'+esc(x)+'</span></li>'; }).join('') || '<div class="none">Nothing notable to confirm.</div>';
  return '<div class="cols">'
    + '<div class="col flags"><h3>'+ICON.flag+'Raw flags</h3><ul>'+flags+'</ul></div>'
    + '<div class="col clear"><h3>'+ICON.ok+'Clear</h3><ul>'+clear+'</ul></div>'
    + '</div>';
}

function drawDial(d){
  var cv = document.getElementById('dial'); if(!cv) return;
  var ctx = cv.getContext('2d'), S = cv.width, cx = S/2, cy = S/2, r = S/2 - 22;
  var start = Math.PI*0.75, end = Math.PI*2.25, span = end - start;
  var color = COLOR[d.verdict] || COLOR.UNKNOWN;
  var target = d.score==null ? 0 : Math.max(0, Math.min(100, d.score))/100;
  ctx.lineCap = 'round';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var t = 0;
  function frame(){
    ctx.clearRect(0,0,S,S);
    ctx.beginPath(); ctx.arc(cx,cy,r,start,end); ctx.strokeStyle = '#262B36'; ctx.lineWidth = 14; ctx.stroke();
    for(var i=0;i<=10;i++){ var a=start+span*(i/10); ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(r+11),cy+Math.sin(a)*(r+11)); ctx.lineTo(cx+Math.cos(a)*(r+15),cy+Math.sin(a)*(r+15)); ctx.strokeStyle='#333A48'; ctx.lineWidth=1.5; ctx.stroke(); }
    var cur = target*t;
    if(cur>0){ ctx.beginPath(); ctx.arc(cx,cy,r,start,start+span*cur); ctx.strokeStyle=color; ctx.lineWidth=14; ctx.stroke();
      var ha=start+span*cur; ctx.beginPath(); ctx.arc(cx+Math.cos(ha)*r, cy+Math.sin(ha)*r, 7, 0, Math.PI*2); ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0; }
    if(t<1){ t=Math.min(1,t+(reduce?1:0.045)); requestAnimationFrame(frame); }
  }
  frame();
}

// ---- Chat ----
var chatHistory = [];
function mountChat(){
  chatHistory = [];
  chatMount.innerHTML = '<div class="chat">'
    + '<div class="chat-head"><span class="spark">'+ICON.spark+'</span>Ask the analyst</div>'
    + '<div class="chat-log" id="clog"></div>'
    + '<div class="suggest" id="sug">'
    +   sug('Why is this risky?') + sug('Explain like I\\'m new to crypto') + sug('Which issue is worst?') + sug('Compare with USDC')
    + '</div>'
    + '<form class="chat-form" id="cf"><input id="ci" placeholder="Ask about this token…" autocomplete="off" /><button id="cb" type="submit">Send</button></form>'
    + '</div>';
  document.getElementById('cf').addEventListener('submit', function(e){ e.preventDefault(); sendChat(document.getElementById('ci').value); });
  document.getElementById('sug').addEventListener('click', function(e){ var b=e.target.closest('button'); if(b) sendChat(b.getAttribute('data-q')); });
}
function sug(q){ return '<button type="button" data-q="'+esc(q)+'">'+esc(q)+'</button>'; }
// Minimal, safe markdown → HTML for analyst replies. Escapes first, then renders
// **bold**, \`code\`, and - / * / 1. lists. Everything else stays plain text.
function mdInline(s){
  return s.replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>').replace(/\\*([^*]+)\\*/g,'<em>$1</em>').replace(/\`([^\`]+)\`/g,'<code>$1</code>');
}
// Escape first, then render inline markdown. Used for AI report fields so
// **bold** / *italic* / \`code\` render instead of showing raw asterisks.
function fmt(s){ return mdInline(esc(s)); }
function mdToHtml(text){
  var lines = esc(text).split('\\n'), out = [], list = null;
  function close(){ if(list){ out.push('</'+list+'>'); list = null; } }
  for(var i=0;i<lines.length;i++){
    var t = lines[i].trim();
    var mu = t.match(/^[-*]\\s+(.*)$/), mo = t.match(/^\\d+\\.\\s+(.*)$/);
    if(mu){ if(list!=='ul'){ close(); out.push('<ul>'); list='ul'; } out.push('<li>'+mdInline(mu[1])+'</li>'); }
    else if(mo){ if(list!=='ol'){ close(); out.push('<ol>'); list='ol'; } out.push('<li>'+mdInline(mo[1])+'</li>'); }
    else if(t===''){ close(); }
    else { close(); out.push('<p>'+mdInline(t)+'</p>'); }
  }
  close();
  return out.join('');
}
function addMsg(role, text){
  var log = document.getElementById('clog');
  var div = document.createElement('div');
  div.className = 'msg ' + (role==='user'?'user':'bot');
  div.innerHTML = role==='user' ? esc(text) : '<div class="who">Analyst</div>'+mdToHtml(text);
  log.appendChild(div); log.scrollTop = log.scrollHeight;
  return div;
}
function sendChat(q){
  q = (q||'').trim(); if(!q || !current) return;
  var ci = document.getElementById('ci'), cb = document.getElementById('cb');
  ci.value = ''; cb.disabled = true;
  addMsg('user', q);
  chatHistory.push({ role:'user', content:q });
  var thinking = addMsg('bot', 'Thinking…');
  fetch('/chat', { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ report: current.report, messages: chatHistory, mode: mode }) })
    .then(function(r){return r.json();}).then(function(d){
      thinking.remove();
      if(!d.ok){ addMsg('bot', d.error || 'Something went wrong.'); return; }
      addMsg('bot', d.answer);
      chatHistory.push({ role:'assistant', content:d.answer });
    }).catch(function(err){ thinking.remove(); addMsg('bot', 'Request failed: '+err.message); })
    .then(function(){ cb.disabled = false; });
}

// ---- Explain This ----
// Attribute-safe escape (also escapes quotes) for values placed in data-* attrs.
function escA(s){ return esc(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// A labelled accordion row with an Explain toggle.
function exItem(key, label, q){
  return '<div class="ex-item">'
    + '<button type="button" class="ex-btn" data-ex="'+escA(key)+'" data-q="'+escA(q)+'" aria-expanded="false" aria-controls="ex-'+escA(key)+'">'
    +   '<span class="ex-l">'+esc(label)+'</span>'
    +   '<span class="ex-cta">'+ICON.spark+'Explain'+CHEV+'</span>'
    + '</button>'
    + '<div class="ex-body" id="ex-'+escA(key)+'"><div class="ex-inner"></div></div>'
    + '</div>';
}
// A compact inline Explain pill (used under flags and the scam-pattern note).
function exMini(key, q){
  return '<div class="ex-item mini">'
    + '<button type="button" class="ex-btn" data-ex="'+escA(key)+'" data-q="'+escA(q)+'" aria-expanded="false" aria-controls="ex-'+escA(key)+'">'
    +   '<span class="ex-cta">'+ICON.spark+'Explain'+CHEV+'</span>'
    + '</button>'
    + '<div class="ex-body" id="ex-'+escA(key)+'"><div class="ex-inner"></div></div>'
    + '</div>';
}
var CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
function exCard(text, isErr){ return '<div class="ex-card'+(isErr?' err-card':'')+'">'+mdToHtml(text)+'</div>'; }

// Toggle one explanation. Reuses the /chat endpoint (AI enrich/chat, no new
// pipeline); caches the answer so re-opening never re-calls the model.
function toggleExplain(btn){
  var key = btn.getAttribute('data-ex');
  var body = document.getElementById('ex-'+key);
  if(!body) return;
  var inner = body.querySelector('.ex-inner');
  if(body.classList.contains('open')){ body.classList.remove('open'); btn.setAttribute('aria-expanded','false'); return; }
  body.classList.add('open'); btn.setAttribute('aria-expanded','true');
  if(explainCache[key]!=null){ inner.innerHTML = exCard(explainCache[key]); return; }
  if(inner.getAttribute('data-loading')==='1') return;
  inner.setAttribute('data-loading','1');
  inner.innerHTML = '<div class="ex-card loading"><span class="ex-spin"></span>Explaining…</div>';
  fetch('/chat', { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ report: current.report, messages:[{ role:'user', content: btn.getAttribute('data-q') }], mode: mode }) })
    .then(function(r){ return r.json(); }).then(function(d){
      inner.removeAttribute('data-loading');
      if(!d.ok){ inner.innerHTML = exCard(d.error || 'Could not generate an explanation.', true); return; }
      explainCache[key] = d.answer;
      inner.innerHTML = exCard(d.answer);
    }).catch(function(err){ inner.removeAttribute('data-loading'); inner.innerHTML = exCard('Request failed: '+err.message, true); });
}

// ---- Share result card ----
// Renders the current result to a high-res canvas (no extra AI call — reuses the
// executive summary already in the report), then offers download / copy / share.
var shareLogoImg = null;
function loadShareLogo(){
  return new Promise(function(res){
    if(shareLogoImg && shareLogoImg.complete && shareLogoImg.naturalWidth){ return res(shareLogoImg); }
    var img = new Image();
    img.onload = function(){ shareLogoImg = img; res(img); };
    img.onerror = function(){ res(null); };
    img.src = '/logo.png';
  });
}
function hexA(hex, a){ var h=String(hex).replace('#',''); return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'; }
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function wrapText(ctx, text, maxW){ var words=String(text).split(/\\s+/), lines=[], cur=''; for(var i=0;i<words.length;i++){ var t=cur?cur+' '+words[i]:words[i]; if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=words[i]; } else { cur=t; } } if(cur) lines.push(cur); return lines; }
function fit(ctx, text, maxW){ text=String(text); if(ctx.measureText(text).width<=maxW) return text; while(text.length>1 && ctx.measureText(text+'…').width>maxW){ text=text.slice(0,-1); } return text+'…'; }
function nowUTC(){ try { var d=new Date(); function p(n){ return (n<10?'0':'')+n; } return d.getUTCFullYear()+'-'+p(d.getUTCMonth()+1)+'-'+p(d.getUTCDate())+' '+p(d.getUTCHours())+':'+p(d.getUTCMinutes())+' UTC'; } catch(e){ return ''; } }

function renderShareCanvas(canvas, d){
  return loadShareLogo().then(function(logo){
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    return ready.then(function(){ return logo; });
  }).then(function(logo){
    var W=1200, H=675, SF=2;
    canvas.width=W*SF; canvas.height=H*SF;
    var ctx=canvas.getContext('2d'); ctx.scale(SF,SF); ctx.textBaseline='alphabetic';
    var sig = COLOR[d.verdict] || COLOR.UNKNOWN;

    var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#13161E'); g.addColorStop(1,'#0C0E13');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
    for(var x=0;x<=W;x+=48){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(var y=0;y<=H;y+=48){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    var rg=ctx.createRadialGradient(90,60,0,90,60,760); rg.addColorStop(0,hexA(sig,0.16)); rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
    roundRect(ctx,24,24,W-48,H-48,28); ctx.strokeStyle='#333A48'; ctx.lineWidth=2; ctx.stroke();

    var PAD=64, ly=58;
    if(logo){ ctx.save(); roundRect(ctx,PAD,ly,56,56,12); ctx.clip(); ctx.drawImage(logo,PAD,ly,56,56); ctx.restore(); }
    var wx = PAD + (logo?74:0);
    ctx.font='700 30px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle='#EDEFF4'; ctx.fillText('Rug', wx, ly+28);
    var rugW=ctx.measureText('Rug').width;
    ctx.fillStyle=COLOR.OK; ctx.fillText('Check', wx+rugW, ly+28);
    ctx.font='500 13px "JetBrains Mono", monospace'; ctx.fillStyle='#767E8F';
    ctx.fillText('AI ON-CHAIN SAFETY ANALYST', wx, ly+50);

    var badge=(VBADGE[d.verdict]||'Unknown').toUpperCase();
    ctx.font='600 14px "JetBrains Mono", monospace';
    var bw=ctx.measureText(badge).width+36, bx=W-PAD-bw, by=64;
    roundRect(ctx,bx,by,bw,34,17); ctx.fillStyle=hexA(sig,0.12); ctx.fill(); ctx.strokeStyle=hexA(sig,0.5); ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle=sig; ctx.fillText(badge, bx+18, by+23);

    ctx.font='700 58px "Space Grotesk", system-ui, sans-serif'; ctx.fillStyle='#EDEFF4';
    ctx.fillText(fit(ctx, d.token.name || d.token.symbol || 'Unknown token', W-2*PAD-250), PAD, 246);
    ctx.font='500 22px "Inter", system-ui, sans-serif'; ctx.fillStyle='#A8AFBE';
    var sub=(d.token.symbol?('$'+d.token.symbol+'   ·   '):'')+(CHAIN_NAME[current.chain]||current.chain)+'   ·   OKX risk '+d.riskLevel;
    ctx.fillText(sub, PAD, 284);

    // Mirror the on-screen dial exactly: the RISK score (d.score), same number,
    // label, colour and arc fill — so the card never disagrees with the website.
    var cx=W-PAD-100, cy=232, rr=90, s0=Math.PI*0.75, span=Math.PI*1.5;
    ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(cx,cy,rr,s0,s0+span); ctx.strokeStyle='#262B36'; ctx.lineWidth=16; ctx.stroke();
    var risk = d.score==null ? null : Math.max(0,Math.min(100,d.score));
    if(risk!=null && risk>0){ ctx.beginPath(); ctx.arc(cx,cy,rr,s0,s0+span*(risk/100)); ctx.strokeStyle=sig; ctx.lineWidth=16; ctx.stroke(); }
    ctx.textAlign='center';
    ctx.font='700 52px "Space Grotesk", system-ui, sans-serif'; ctx.fillStyle=sig;
    ctx.fillText(risk==null?'—':String(risk), cx, cy+10);
    ctx.font='500 12px "JetBrains Mono", monospace'; ctx.fillStyle='#767E8F';
    ctx.fillText('RISK / 100', cx, cy+36);
    ctx.textAlign='left';

    ctx.font='600 26px "Space Grotesk", system-ui, sans-serif'; ctx.fillStyle='#EDEFF4';
    ctx.fillText(fit(ctx, d.headline || '', W-2*PAD), PAD, 372);

    var quote=(d.ai && d.ai.executiveSummary) ? d.ai.executiveSummary : (d.headline||'');
    ctx.font='400 21px "Inter", system-ui, sans-serif'; ctx.fillStyle='#C2C8D4';
    var lines=wrapText(ctx,'“'+quote+'”',W-2*PAD), maxLines=3;
    for(var i=0;i<lines.length && i<maxLines;i++){
      var ln=lines[i];
      if(i===maxLines-1 && lines.length>maxLines) ln=fit(ctx, ln+' …', W-2*PAD);
      ctx.fillText(ln, PAD, 422+i*30);
    }

    ctx.strokeStyle='#262B36'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(PAD,H-92); ctx.lineTo(W-PAD,H-92); ctx.stroke();
    ctx.font='500 14px "JetBrains Mono", monospace'; ctx.fillStyle='#767E8F';
    ctx.fillText('Powered by OKX Onchain OS   ·   AI explanations by RugCheck', PAD, H-58);
    ctx.textAlign='right'; ctx.fillText(nowUTC(), W-PAD, H-58); ctx.textAlign='left';
  });
}

function shareFileName(d){ return 'rugcheck-'+String(d.token.symbol||'token').toLowerCase().replace(/[^a-z0-9]/g,'')+'.png'; }
function shareText(d){ return 'RugCheck scanned '+(d.token.name||d.token.symbol||'a token')+': '+(VBADGE[d.verdict]||'Unknown')+'. Powered by OKX Onchain OS. #OKXAI'; }
function downloadBlob(blob, name){ var u=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },1500); }

// X (Twitter) web-intent: prefilled text + a deep link back to this exact scan.
// Images can't be attached via URL, so the card is downloaded/copied separately.
function xIntentUrl(d){
  var link = location.origin + '/?address=' + encodeURIComponent(d.token.address||'') + '&chain=' + encodeURIComponent((current&&current.chain)||'ethereum');
  return 'https://x.com/intent/tweet?text=' + encodeURIComponent(shareText(d)) + '&url=' + encodeURIComponent(link);
}
// Render the card to an off-screen canvas and resolve its PNG blob (no DOM needed,
// so the results-view "Post on X" button can produce the image too).
function buildShareBlob(d){
  var canvas = document.createElement('canvas');
  return renderShareCanvas(canvas, d).then(function(){
    return new Promise(function(res){ canvas.toBlob(function(b){ res(b); }, 'image/png'); });
  });
}
// Share to X WITH the image: X's intent URL can't carry an image, so we open the
// composer (prefilled text + deep link) AND copy the card to the clipboard in the
// same click, so the user can paste it into the post. A promise-valued
// ClipboardItem keeps the copy inside the user gesture while the canvas renders.
function shareToX(d, onMsg){
  if(!d) return;
  var msg = function(t){ if(typeof onMsg==='function') onMsg(t); };
  window.open(xIntentUrl(d), '_blank', 'noopener,noreferrer');
  if(navigator.clipboard && window.ClipboardItem){
    try {
      navigator.clipboard.write([ new ClipboardItem({ 'image/png': buildShareBlob(d).then(function(b){ return b || new Blob([], {type:'image/png'}); }) }) ])
        .then(function(){ msg('Image copied — paste it into your X post with ⌘/Ctrl+V.'); })
        .catch(function(){ msg('Opened X. Use Download or Copy image to attach the card.'); });
    } catch(e){ msg('Opened X. Use Download or Copy image to attach the card.'); }
  } else {
    msg('Opened X. Use Download or Copy image to attach the card.');
  }
}

function openShareCard(){
  if(!current) return;
  var d = current.report;
  var overlay = document.createElement('div'); overlay.className='share-overlay';
  overlay.innerHTML = '<div class="share-modal" role="dialog" aria-modal="true" aria-label="Shareable result card">'
    + '<div class="share-modal-head"><span>Shareable result card</span><button type="button" class="share-close" aria-label="Close">'+ICON.close+'</button></div>'
    + '<div class="share-canvas-wrap"><canvas id="shareCanvas"></canvas></div>'
    + '<div class="share-actions">'
    +   '<button type="button" id="xBtn" class="sa-x">'+ICON.x+'Share on X</button>'
    +   '<button type="button" id="dlBtn" class="sa-primary">'+ICON.download+'Download</button>'
    +   '<button type="button" id="cpBtn">'+ICON.copy+'Copy image</button>'
    +   '<button type="button" id="shBtn">'+ICON.share+'Share</button>'
    + '</div>'
    + '<div class="share-note" id="shareNote"></div>'
    + '</div>';
  document.body.appendChild(overlay);
  var note = overlay.querySelector('#shareNote');
  function close(){ overlay.remove(); document.removeEventListener('keydown', onKey); }
  function onKey(e){ if(e.key==='Escape') close(); }
  overlay.addEventListener('click', function(e){ if(e.target===overlay) close(); });
  overlay.querySelector('.share-close').addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  overlay.querySelector('#xBtn').addEventListener('click', function(){
    shareToX(d, function(t){ note.textContent = t; });
  });

  var canvas = overlay.querySelector('#shareCanvas');
  var cpBtn = overlay.querySelector('#cpBtn'), shBtn = overlay.querySelector('#shBtn');
  if(!(navigator.clipboard && window.ClipboardItem)) cpBtn.style.display='none';
  if(!(navigator.share && navigator.canShare)) shBtn.style.display='none';

  renderShareCanvas(canvas, d).then(function(){
    overlay.querySelector('#dlBtn').addEventListener('click', function(){
      canvas.toBlob(function(b){ if(b) downloadBlob(b, shareFileName(d)); }, 'image/png');
    });
    cpBtn.addEventListener('click', function(){
      canvas.toBlob(function(b){
        if(!b) return;
        navigator.clipboard.write([new ClipboardItem({'image/png': b})])
          .then(function(){ note.textContent='Image copied to clipboard.'; })
          .catch(function(e){ note.textContent='Copy failed: '+e.message; });
      }, 'image/png');
    });
    shBtn.addEventListener('click', function(){
      canvas.toBlob(function(b){
        if(!b) return;
        var file = new File([b], shareFileName(d), { type:'image/png' });
        if(navigator.canShare && navigator.canShare({ files:[file] })){
          navigator.share({ files:[file], title:'RugCheck result', text: shareText(d) }).catch(function(){});
        } else { downloadBlob(b, shareFileName(d)); note.textContent='Direct share not supported here — downloaded the image instead.'; }
      }, 'image/png');
    });
  }).catch(function(err){ note.textContent='Could not render the card: '+err.message; });
}

// ---- Utilities: run a scan, toast, clipboard, recents, empty state, skeleton ----
function runScan(address, chain){
  if(!address) return;
  var ai = document.getElementById('addr'); ai.value = address;
  var sel = document.getElementById('chain');
  if(chain && [].some.call(sel.options, function(o){ return o.value===chain; })) sel.value = chain;
  f.requestSubmit();
  try { window.scrollTo({ top:0, behavior:'smooth' }); } catch(e){}
}
function toast(msg){
  if(!msg) return;
  var host = document.getElementById('toasts');
  if(!host){ host = document.createElement('div'); host.id = 'toasts'; document.body.appendChild(host); }
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  host.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('show'); });
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2600);
}
function copyText(text, okMsg){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ toast(okMsg||'Copied'); }).catch(function(){ toast('Copy failed'); });
  } else { toast('Clipboard not available'); }
}
function loadRecent(){ try { return JSON.parse(localStorage.getItem('rugcheck.recent') || '[]'); } catch(e){ return []; } }
function saveRecent(list){ try { localStorage.setItem('rugcheck.recent', JSON.stringify(list.slice(0,6))); } catch(e){} }
function pushRecent(d, chain){
  if(!d || d.found===false || !d.token || !d.token.address) return;
  var item = { address:d.token.address, chain:chain, symbol:d.token.symbol||'', verdict:d.verdict, logo:d.token.logo||'' };
  var list = loadRecent().filter(function(x){ return !(x.address===item.address && x.chain===item.chain); });
  list.unshift(item);
  saveRecent(list);
  renderRecent();
}
function renderRecent(){
  var el = document.getElementById('recent'); if(!el) return;
  var list = loadRecent();
  if(!list.length){ el.innerHTML = ''; return; }
  var items = list.map(function(x){
    var dot = COLOR[x.verdict] || COLOR.UNKNOWN;
    var logo = x.logo ? '<img src="'+escA(x.logo)+'" alt="" />' : '';
    return '<button type="button" class="recent-chip" data-addr="'+escA(x.address)+'" data-chain="'+escA(x.chain)+'">'
      + '<span class="rc-dot" style="background:'+dot+'"></span>'+logo
      + '<span class="rc-sym">'+esc(x.symbol||short(x.address))+'</span>'
      + '</button>';
  }).join('');
  el.innerHTML = '<div class="recent-head">Recent</div><div class="recent-row">'+items+'</div>';
}
function renderEmptyState(){
  var chips = EXAMPLES.map(function(x){
    return '<button type="button" class="ex-token" data-addr="'+escA(x.address)+'" data-chain="'+escA(x.chain)+'">'
      + '<span class="ex-token-sym">'+esc(x.label)+'</span>'
      + '<span class="ex-token-sub">'+esc(x.sub)+'</span>'
      + '</button>';
  }).join('');
  return '<div class="empty">'
    + '<div class="empty-head">Try an example</div>'
    + '<div class="example-tokens">'+chips+'</div>'
    + '<p class="empty-note">Or paste any token contract above and hit Scan.</p>'
    + '</div>';
}
function skeletonHTML(chain, withAi){
  function bar(w){ return '<div class="sk sk-bar" style="width:'+w+'"></div>'; }
  return '<div class="readout">'
    + '<div class="verdict">'
    +   '<div class="sk sk-dial"></div>'
    +   '<div class="vmeta" style="flex:1 1 auto">'+bar('96px')+bar('72%')+bar('54%')+bar('40%')+'</div>'
    + '</div>'
    + '<div class="metrics">'
    +   '<div class="metric">'+bar('60%')+bar('82%')+'</div>'
    +   '<div class="metric">'+bar('60%')+bar('82%')+'</div>'
    +   '<div class="metric">'+bar('60%')+bar('82%')+'</div>'
    +   '<div class="metric">'+bar('60%')+bar('82%')+'</div>'
    + '</div>'
    + '<div class="sk-status"><span class="sweep"></span>Scanning contract on '+esc(chain)+(withAi?', then reasoning…':'…')+'</div>'
    + '</div>';
}

// Deep link: /?address=0x..&chain=bsc&mode=trader auto-runs the scan.
(function autorun(){
  var p = new URLSearchParams(location.search);
  var a = (p.get('address')||'').trim();
  if(!a){ out.innerHTML = renderEmptyState(); return; }
  document.getElementById('addr').value = a;
  var ch = (p.get('chain')||'ethereum').toLowerCase();
  var sel = document.getElementById('chain');
  if([].some.call(sel.options, function(o){ return o.value===ch; })) sel.value = ch;
  var pm = p.get('mode');
  if(['beginner','trader','developer'].indexOf(pm)!==-1){ mode = pm;
    [].forEach.call(modeBox.querySelectorAll('button'), function(x){ x.setAttribute('aria-pressed', x.getAttribute('data-mode')===pm ? 'true':'false'); }); }
  f.requestSubmit();
})();
</script>
</body>
</html>`;
