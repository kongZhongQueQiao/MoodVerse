import { networkInterfaces } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const port = String(process.env.PORT || "3000");
const host = "0.0.0.0";

function getNetworkIPv4List() {
  const nets = networkInterfaces();
  const result = [];

  const isLikelyVirtualAdapter = (name) => {
    const key = name.toLowerCase();
    return (
      key.includes("vmware") ||
      key.includes("virtualbox") ||
      key.includes("vbox") ||
      key.includes("hyper-v") ||
      key.includes("loopback") ||
      key.includes("tailscale")
    );
  };

  for (const [name, addresses] of Object.entries(nets)) {
    if (!addresses) continue;
    if (isLikelyVirtualAdapter(name)) continue;

    for (const address of addresses) {
      const family = typeof address.family === "string" ? address.family : String(address.family);
      if (family !== "IPv4") continue;
      if (address.internal) continue;
      if (address.address.startsWith("169.254.")) continue;

      result.push({
        name,
        ip: address.address,
      });
    }
  }

  const rank = (name) => {
    const key = name.toLowerCase();
    if (key.includes("radmin")) return 0;
    if (key.includes("ethernet")) return 1;
    if (key.includes("wi-fi") || key.includes("wifi") || key.includes("wlan")) return 2;
    return 3;
  };

  return result.sort((a, b) => {
    const diff = rank(a.name) - rank(b.name);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

const candidates = getNetworkIPv4List();

console.log("\n[MoodVerse] Dev server will listen on all network interfaces.");
console.log(`[MoodVerse] Local URL:   http://localhost:${port}`);

if (candidates.length) {
  console.log("[MoodVerse] Network URLs:");
  for (const item of candidates) {
    console.log(`  - http://${item.ip}:${port}  (${item.name})`);
  }
  console.log("[MoodVerse] Tip: 其他电脑需与上述网卡处于同一网络或同一 VPN。");
} else {
  console.log("[MoodVerse] Network URL: unavailable (no external IPv4 detected)");
}

console.log("");

const nextCli = path.resolve("node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextCli, "dev", "-H", host, "-p", port], {
  stdio: "inherit",
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
