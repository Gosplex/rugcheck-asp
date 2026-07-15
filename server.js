// RugCheck HTTP service.
//   GET  /health                              → { ok: true }
//   GET  /ai-status                           → { enabled, model }
//   GET  /rugcheck?address=..&chain=..        → deterministic JSON report + verdict
//        add &ai=1&mode=beginner|developer|trader to attach an AI analysis
//   POST /chat  { report, messages, mode }    → AI follow-up answer
//   GET  /                                    → demo web UI
//
// Run locally:  npm start   (then open http://localhost:8787)

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./config.js";
loadEnv();

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Brand logo — read once, then served for both the header mark and the favicon.
let LOGO = null;
function logo() {
  if (LOGO === null) {
    try { LOGO = fs.readFileSync(path.join(HERE, "assets", "logo.png")); }
    catch { LOGO = false; }
  }
  return LOGO;
}

import { rugcheck } from "./analyze.js";
import { aiEnabled, aiModel, enrich, chat } from "./ai.js";
import { handleMcpPost } from "./mcp.js";
import { PAGE } from "./page.js";

const PORT = process.env.PORT || 8787;
const EVM = /^0x[a-fA-F0-9]{40}$/;
const SOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const MODES = ["beginner", "developer", "trader"];

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body, null, 2));
}

function readBody(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > limit) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") return json(res, 204, {});

  if (url.pathname === "/health") return json(res, 200, { ok: true, service: "rugcheck" });

  // Logo — used by the header mark and the favicon.
  if (url.pathname === "/logo.png" || url.pathname === "/favicon.ico") {
    const buf = logo();
    if (!buf) return json(res, 404, { ok: false, error: "logo not found" });
    res.writeHead(200, { "content-type": "image/png", "cache-control": "public, max-age=86400" });
    return res.end(buf);
  }

  if (url.pathname === "/ai-status") {
    return json(res, 200, { enabled: aiEnabled(), model: aiEnabled() ? aiModel() : null });
  }

  // MCP endpoint (Streamable HTTP, stateless) — how other agents call RugCheck
  // via OKX.AI's A2MCP path. Same engine as /rugcheck, exposed as a `rugcheck` tool.
  if (url.pathname === "/mcp") {
    if (req.method !== "POST") {
      return json(res, 405, { ok: false, error: "MCP endpoint: send JSON-RPC via POST." });
    }
    try {
      const { status, payload } = await handleMcpPost(await readBody(req));
      if (payload === null) {
        res.writeHead(status, {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type, mcp-protocol-version, mcp-session-id",
          "access-control-allow-methods": "GET, POST, OPTIONS",
        });
        return res.end();
      }
      return json(res, status, payload);
    } catch (e) {
      return json(res, 200, { jsonrpc: "2.0", id: null, error: { code: -32603, message: e.message } });
    }
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PAGE);
  }

  // Deterministic scan (+ optional AI enrichment via ?ai=1)
  if (url.pathname === "/rugcheck" && req.method === "GET") {
    const address = (url.searchParams.get("address") || "").trim();
    const chain = (url.searchParams.get("chain") || "ethereum").trim().toLowerCase();
    const wantAi = url.searchParams.get("ai") === "1";
    const mode = MODES.includes(url.searchParams.get("mode")) ? url.searchParams.get("mode") : "beginner";
    if (!address) return json(res, 400, { ok: false, error: "Provide ?address=<token contract>" });
    if (!EVM.test(address) && !SOL.test(address)) {
      return json(res, 400, { ok: false, error: "That doesn't look like a valid token contract address." });
    }
    try {
      const report = await rugcheck(address, chain); // FACTS + deterministic verdict (unchanged)
      let ai = null;
      let aiError = null;
      // Skip AI when there's no token data to reason about (wrong chain / bad address).
      if (wantAi && aiEnabled() && report.found !== false) {
        try {
          ai = await enrich(report, mode);
        } catch (e) {
          aiError = e.message; // AI is additive — never fail the whole scan on it
        }
      }
      return json(res, 200, { ok: true, ...report, ai, aiError, aiAvailable: aiEnabled() });
    } catch (e) {
      return json(res, 502, { ok: false, error: "OKX lookup failed: " + e.message });
    }
  }

  // Conversational follow-up
  if (url.pathname === "/chat" && req.method === "POST") {
    if (!aiEnabled()) return json(res, 503, { ok: false, error: "AI is not configured. Set OPENROUTER_API_KEY." });
    try {
      const parsed = JSON.parse(await readBody(req));
      const { report, messages, mode } = parsed || {};
      if (!report || !Array.isArray(messages) || !messages.length) {
        return json(res, 400, { ok: false, error: "Send { report, messages, mode }." });
      }
      const m = MODES.includes(mode) ? mode : "beginner";
      const answer = await chat(report, messages, m);
      return json(res, 200, { ok: true, answer });
    } catch (e) {
      return json(res, 502, { ok: false, error: "Chat failed: " + e.message });
    }
  }

  return json(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`RugCheck running → http://localhost:${PORT}`);
  console.log(`AI analyst: ${aiEnabled() ? "enabled (" + aiModel() + ")" : "disabled (set OPENROUTER_API_KEY to enable)"}`);
});
