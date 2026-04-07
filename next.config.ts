import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

type NetworkAddress = {
  address: string;
  family: string | number;
  internal?: boolean;
};

const getAllowedDevOrigins = () => {
  const origins = new Set<string>(["localhost", "127.0.0.1"]);
  const nets = networkInterfaces() as Record<string, NetworkAddress[] | undefined>;

  for (const addresses of Object.values(nets)) {
    if (!Array.isArray(addresses)) continue;

    for (const address of addresses) {
      const family = typeof address.family === "string" ? address.family : String(address.family);
      if (family !== "IPv4") continue;
      if (address.internal) continue;
      if (address.address.startsWith("169.254.")) continue;

      origins.add(address.address);
    }
  }

  return Array.from(origins);
};

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  turbopack: {
    root: currentDir,
  },
};

export default nextConfig;
