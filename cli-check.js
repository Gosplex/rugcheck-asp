// Quick terminal check without the HTTP server.
//   node cli-check.js <address> [chain]
import { rugcheck } from "./analyze.js";

const [, , address, chain = "ethereum"] = process.argv;
if (!address) {
  console.error("Usage: node cli-check.js <token-address> [chain]");
  process.exit(1);
}

rugcheck(address, chain)
  .then((r) => {
    const mark = { OK: "[ OK ]", CAUTION: "[CAUTION]", AVOID: "[AVOID]", UNKNOWN: "[ ? ]" }[r.verdict] || "[ ? ]";
    console.log(`\n${mark}  ${r.headline}  (OKX risk: ${r.riskLevel}, score: ${r.score ?? "n/a"})`);
    console.log(`${r.token.name} (${r.token.symbol}) — ${r.token.address}`);
    if (r.concerns.length) console.log("Concerns:\n" + r.concerns.map((c) => "  - " + c.label).join("\n"));
    if (r.positives.length) console.log("Positives:\n" + r.positives.map((p) => "  + " + p).join("\n"));
    console.log("");
  })
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  });
