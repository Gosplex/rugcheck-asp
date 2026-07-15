// RugCheck MCP surface — exposes the SAME engine (analyze.js + ai.js) as an
// MCP tool so other agents can call it through OKX.AI's A2MCP path.
//
// Transport: MCP Streamable HTTP, operated statelessly. The server accepts a
// JSON-RPC request (or batch) via POST /mcp and returns a JSON-RPC response.
// The deterministic scan and the AI layer are unchanged — this is only a
// protocol doorway into rugcheck() / enrich().

import { rugcheck } from "./analyze.js";
import { enrich, aiEnabled } from "./ai.js";

const SERVER_PROTOCOL = "2025-06-18";
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];
const EVM = /^0x[a-fA-F0-9]{40}$/;
const SOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const MODES = ["beginner", "developer", "trader"];

const TOOLS = [
  {
    name: "rugcheck",
    title: "RugCheck token safety scan",
    description:
      "Scan a crypto token contract for safety using OKX Onchain OS data. Returns a verdict " +
      "(OK / CAUTION / AVOID / UNKNOWN), a 0-100 risk score, the OKX risk level, market data " +
      "(price, liquidity, market cap, holders), a list of risk flags (honeypot, mintable, " +
      "ownership, freeze authority, taxes, holder concentration, ...) and confirmed positives. " +
      "With include_ai, also returns a plain-English AI analyst explanation: executive summary, " +
      "per-risk breakdown, confidence, and scam-pattern watch. Facts come from OKX; the tool never " +
      "invents data and never gives financial advice.",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Token contract address — an EVM 0x… address or a Solana base58 address.",
        },
        chain: {
          type: "string",
          description:
            "Chain the token lives on. One of: ethereum, bsc, base, arbitrum, polygon, optimism, avalanche, solana.",
          default: "ethereum",
        },
        include_ai: {
          type: "boolean",
          description: "Include the AI analyst explanation in the result (default true).",
          default: true,
        },
        mode: {
          type: "string",
          enum: ["beginner", "trader", "developer"],
          description: "Lens for the AI explanation (default beginner).",
          default: "beginner",
        },
      },
      required: ["address"],
      additionalProperties: false,
    },
  },
];

function ok(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function err(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function callRugcheck(args = {}) {
  const address = String(args.address || "").trim();
  const chain = String(args.chain || "ethereum").trim().toLowerCase();
  if (!address || (!EVM.test(address) && !SOL.test(address))) {
    return toolResult("That doesn't look like a valid token contract address (expected 0x… or a Solana address).", null, true);
  }
  let report;
  try {
    report = await rugcheck(address, chain);
  } catch (e) {
    return toolResult("Lookup failed: " + (e.message || "OKX request error"), null, true);
  }
  let ai = null;
  if (args.include_ai !== false && aiEnabled() && report.found !== false) {
    const mode = MODES.includes(args.mode) ? args.mode : "beginner";
    try {
      ai = await enrich(report, mode);
    } catch {
      /* AI is additive — never fail the scan on it */
    }
  }
  const full = { ...report, ai };
  return toolResult(JSON.stringify(full, null, 2), full, false);
}

// MCP tool result: a text block for any client, plus structuredContent for
// clients that support it.
function toolResult(text, structured, isError) {
  const r = { content: [{ type: "text", text }], isError: Boolean(isError) };
  if (structured) r.structuredContent = structured;
  return r;
}

// Handle one JSON-RPC message. Returns the response object, or null for a
// notification (no id) that needs no reply.
async function handleRpc(msg) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg && msg.id, -32600, "Invalid Request");
  }
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;
  try {
    switch (method) {
      case "initialize": {
        const want = params && params.protocolVersion;
        const version = SUPPORTED.includes(want) ? want : SERVER_PROTOCOL;
        return ok(id, {
          protocolVersion: version,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "rugcheck", title: "RugCheck", version: "0.1.0" },
          instructions:
            "Call the `rugcheck` tool with a token `address` and `chain` to get a safety verdict, " +
            "risk score, flags, and an AI explanation. Data is from OKX Onchain OS. Not financial advice.",
        });
      }
      case "ping":
        return ok(id, {});
      case "tools/list":
        return ok(id, { tools: TOOLS });
      case "tools/call": {
        const name = params && params.name;
        if (name !== "rugcheck") return err(id, -32602, `Unknown tool: ${name}`);
        return ok(id, await callRugcheck((params && params.arguments) || {}));
      }
      default:
        // Notifications (e.g. notifications/initialized) and unknown notifications: no reply.
        if (isNotification) return null;
        return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (isNotification) return null;
    return err(id, -32603, (e && e.message) || "Internal error");
  }
}

// Entry point for the HTTP layer: parse + dispatch a POST body (single or batch).
// Returns { status, payload }; payload null means "202 Accepted, no body".
export async function handleMcpPost(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 200, payload: err(null, -32700, "Parse error") };
  }
  if (Array.isArray(parsed)) {
    if (!parsed.length) return { status: 200, payload: err(null, -32600, "Invalid Request") };
    const outs = (await Promise.all(parsed.map(handleRpc))).filter(Boolean);
    return outs.length ? { status: 200, payload: outs } : { status: 202, payload: null };
  }
  const out = await handleRpc(parsed);
  return out ? { status: 200, payload: out } : { status: 202, payload: null };
}
