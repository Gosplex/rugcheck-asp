// RugCheck core — fetches an OKX Onchain OS token report and turns it into a
// plain-English safety verdict.
//
// Two data sources, same `data` shape → so assess() below is unchanged:
//   • HTTP  — the OKX Web3 API (https://web3.okx.com). Used when OKX_API_KEY is
//     set. This is the deploy path (works on Render / Cloud Run / anywhere).
//   • CLI   — the local `onchainos` binary. Used for local dev when no key is set.
// Force one with RUGCHECK_SOURCE=http|cli.

import { execFile } from "node:child_process";
import crypto from "node:crypto";

const OKX_BASE = process.env.OKX_API_BASE || "https://web3.okx.com";

// Prefer the HTTP API when credentials exist; fall back to the local CLI.
function useHttp() {
  const forced = (process.env.RUGCHECK_SOURCE || "").toLowerCase();
  if (forced === "http") return true;
  if (forced === "cli") return false;
  return Boolean(process.env.OKX_API_KEY);
}

// OKX Web3 API request signing (HMAC-SHA256 over ts+method+path+body, base64).
// Docs: OK-ACCESS-* headers + OK-ACCESS-PROJECT for the Web3/DEX product.
function okxHeaders(method, requestPath, bodyStr = "") {
  const ts = new Date().toISOString();
  const sign = crypto
    .createHmac("sha256", process.env.OKX_API_SECRET || "")
    .update(ts + method.toUpperCase() + requestPath + bodyStr)
    .digest("base64");
  return {
    "OK-ACCESS-KEY": process.env.OKX_API_KEY || "",
    "OK-ACCESS-SIGN": sign,
    "OK-ACCESS-TIMESTAMP": ts,
    "OK-ACCESS-PASSPHRASE": process.env.OKX_API_PASSPHRASE || "",
    "OK-ACCESS-PROJECT": process.env.OKX_PROJECT_ID || "",
    "content-type": "application/json",
  };
}

// Call one OKX endpoint (GET or POST) and unwrap its { code, msg, data } envelope.
async function okxCall(method, path, { params, body } = {}) {
  const qs = params ? new URLSearchParams(params).toString() : "";
  const requestPath = qs ? `${path}?${qs}` : path;
  const bodyStr = body !== undefined ? JSON.stringify(body) : "";
  const opts = { method, headers: okxHeaders(method, requestPath, bodyStr), signal: AbortSignal.timeout(30_000) };
  if (bodyStr) opts.body = bodyStr;
  const res = await fetch(OKX_BASE + requestPath, opts);
  if (!res.ok) throw new Error(`OKX ${res.status} on ${path}`);
  const j = await res.json();
  if (j.code !== undefined && String(j.code) !== "0") {
    throw new Error(`OKX ${path}: ${j.msg || j.detailMsg || "code " + j.code}`);
  }
  return j.data;
}

// Compose the four OKX endpoints the CLI's `token report` wraps into the SAME
// { info, priceInfo, security, advancedInfo } shape assess() consumes.
// Verified live against web3.okx.com: basic-info/price-info are POST with an
// array body; token-scan is POST with { source, tokenList:[{chainId, contractAddress}] };
// advanced-info is GET with query params.
async function runReportHttp(address, chain) {
  const chainIndex = CHAIN_INDEX[String(chain).toLowerCase()] || String(chain);
  const one = { chainIndex, tokenContractAddress: address };
  const [basic, price, security, advanced] = await Promise.all([
    okxCall("POST", "/api/v6/dex/market/token/basic-info", { body: [one] }).catch(() => null),
    okxCall("POST", "/api/v6/dex/market/price-info", { body: [one] }).catch(() => null),
    okxCall("POST", "/api/v6/security/token-scan", { body: { source: "1", tokenList: [{ chainId: chainIndex, contractAddress: address }] } }).catch(() => null),
    okxCall("GET", "/api/v6/dex/market/token/advanced-info", { params: one }).catch(() => null),
  ]);
  if (!basic && !price && !security) {
    throw new Error("OKX API returned no data (check OKX_API_KEY / OKX_PROJECT_ID and the token/chain).");
  }
  const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
  return {
    address,
    chain: chainIndex,
    info: arr(basic),
    priceInfo: arr(price),
    security: arr(security),
    advancedInfo: (Array.isArray(advanced) ? advanced[0] : advanced) || {},
  };
}

// Local fallback: the onchainos CLI (already returns the composite `data`).
function runReportCli(address, chain) {
  return new Promise((resolve, reject) => {
    execFile(
      "onchainos",
      ["token", "report", "--chain", String(chain), "--address", String(address)],
      { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err && !stdout) return reject(new Error(stderr || err.message));
        let parsed;
        try {
          parsed = JSON.parse(stdout);
        } catch {
          return reject(new Error("Could not parse OKX response: " + stdout.slice(0, 200)));
        }
        if (!parsed.ok) return reject(new Error(parsed.msg || "OKX report failed"));
        resolve(parsed.data);
      }
    );
  });
}

// Named risk flags in the security block, mapped to human-readable concerns.
// Order matters: the most damning are listed first.
const RISK_FLAGS = [
  ["isHoneypot", "Honeypot: you may be unable to sell", "critical"],
  ["isFakeLiquidity", "Fake or spoofed liquidity", "critical"],
  ["isLiquidityRemoval", "Liquidity can be pulled (rug risk)", "critical"],
  ["isAirdropScam", "Airdrop scam pattern", "critical"],
  ["isCounterfeit", "Counterfeit of a known token", "high"],
  ["isHasFrozenAuth", "Owner can freeze your tokens", "high"],
  ["isHasAssetEditAuth", "Owner can edit balances", "high"],
  ["isMintable", "Supply is mintable (owner can dilute)", "medium"],
  ["isNotOpenSource", "Contract is not open source", "medium"],
  ["isNotRenounced", "Ownership not renounced", "medium"],
  ["isLowLiquidity", "Low liquidity, hard to exit", "medium"],
  ["isVeryLowLpBurn", "Very little LP burned", "medium"],
  ["isDumping", "Insiders currently dumping", "high"],
  ["isWash", "Wash-trading detected", "medium"],
];

const CHAIN_INDEX = {
  ethereum: "1", eth: "1", bsc: "56", bnb: "56", polygon: "137",
  arbitrum: "42161", base: "8453", optimism: "10", avalanche: "43114",
  solana: "501", sol: "501",
};

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Fetch the OKX composite report for one token → parsed `data` object.
// Dispatches to the HTTP API (deploy) or the local CLI (dev). Shape is identical.
export function runReport(address, chain = "ethereum") {
  return useHttp() ? runReportHttp(address, chain) : runReportCli(address, chain);
}

// Turn a raw OKX report into a structured RugCheck verdict.
export function assess(data) {
  const info = (data.info && data.info[0]) || {};
  const price = (data.priceInfo && data.priceInfo[0]) || {};
  const sec = (data.security && data.security[0]) || {};
  const adv = data.advancedInfo || {};

  const concerns = [];
  const positives = [];

  // 1. Named security flags.
  for (const [key, label, weight] of RISK_FLAGS) {
    if (sec[key] === true) concerns.push({ label, weight });
  }

  // 2. Taxes (base-10 numbers in the API, e.g. "0.0" .. or a percent).
  const buyTax = num(sec.buyTaxes);
  const sellTax = num(sec.sellTaxes);
  if (sellTax !== null && sellTax > 10) concerns.push({ label: `High sell tax (${sellTax}%)`, weight: "high" });
  else if (buyTax !== null && buyTax > 10) concerns.push({ label: `High buy tax (${buyTax}%)`, weight: "medium" });
  else if (buyTax === 0 && sellTax === 0) positives.push("No buy/sell tax");

  // 3. Holder concentration.
  const top10 = num(adv.top10HoldPercent);
  if (top10 !== null) {
    if (top10 > 70) concerns.push({ label: `Top 10 holders own ${top10.toFixed(1)}% (very concentrated)`, weight: "high" });
    else if (top10 > 50) concerns.push({ label: `Top 10 holders own ${top10.toFixed(1)}% (concentrated)`, weight: "medium" });
    else positives.push(`Top 10 holders own ${top10.toFixed(1)}%`);
  }
  const devHold = num(adv.devHoldingPercent);
  if (devHold !== null && devHold > 10) concerns.push({ label: `Dev holds ${devHold}%`, weight: "medium" });

  // 4. Liquidity.
  const liq = num(price.liquidity);
  if (liq !== null && liq < 10_000) concerns.push({ label: `Thin liquidity ($${Math.round(liq).toLocaleString()})`, weight: "medium" });

  // 5. Not-found guard. Querying a token on the WRONG chain (or a bad address)
  // returns a shell report: no name, no market data — yet OKX may still stamp it
  // with a default riskLevel like "LOW". Don't dress that up as "looks clean";
  // report that we have no data so the caller can fix the address/chain.
  const hasIdentity = Boolean(info.tokenName || info.tokenSymbol);
  const hasMarket = [price.price, price.liquidity, price.marketCap, price.holders]
    .some((v) => { const n = num(v); return n !== null && n > 0; });
  const found = hasIdentity || hasMarket;

  // 6. Verdict — driven by OKX's authoritative riskLevel, then escalated by concerns.
  const level = (sec.riskLevel || "").toUpperCase();
  const hasCritical = concerns.some((c) => c.weight === "critical");
  const hasHigh = concerns.some((c) => c.weight === "high");

  // OKX's server-computed riskLevel is authoritative. We only ESCALATE it when we
  // see a high/critical flag OKX's level didn't already reflect. A mere medium
  // structural note (e.g. "mintable" on a stablecoin) is shown but doesn't downgrade.
  // `score` (0..100) drives the risk dial; null means indeterminate.
  let verdict, headline, score;
  if (!found) {
    verdict = "UNKNOWN";
    headline = "No data for this token. Check the address and that the selected chain is correct.";
    score = null;
  } else if (level === "CRITICAL" || hasCritical) {
    verdict = "AVOID"; headline = "High risk. Do not buy."; score = level === "CRITICAL" ? 95 : 88;
  } else if (level === "HIGH" || hasHigh) {
    verdict = "CAUTION"; headline = "Notable risks found."; score = 70;
  } else if (level === "MEDIUM") {
    verdict = "CAUTION"; headline = "Some caution advised."; score = 48;
  } else if (level === "LOW") {
    verdict = "OK";
    headline = concerns.length ? "Looks clean, minor notes." : "No red flags found.";
    score = concerns.length ? 24 : 10;
  } else if (sec.isChainSupported && concerns.length === 0) {
    verdict = "OK"; headline = "No red flags found."; score = 12;
  } else {
    verdict = "UNKNOWN"; headline = "Not enough data to judge."; score = null;
  }

  return {
    token: {
      name: info.tokenName || null,
      symbol: info.tokenSymbol || null,
      address: data.address || sec.tokenAddress || null,
      chainIndex: info.chainIndex || String(data.chain || ""),
      logo: info.tokenLogoUrl || null,
    },
    market: {
      priceUsd: num(price.price),
      liquidityUsd: liq,
      marketCapUsd: num(price.marketCap),
      holders: num(price.holders),
      priceChange24H: num(price.priceChange24H),
    },
    verdict,
    score,
    headline,
    found,
    riskLevel: found ? (level || "UNKNOWN") : "UNKNOWN",
    chainSupported: sec.isChainSupported !== false,
    concerns,
    positives,
    disclaimer:
      "RugCheck reports factual on-chain data from OKX Onchain OS. It is not investment advice. Always do your own research.",
  };
}

// One-shot convenience: fetch + assess.
export async function rugcheck(address, chain = "ethereum") {
  const data = await runReport(address, chain);
  return assess(data);
}

export { CHAIN_INDEX };
