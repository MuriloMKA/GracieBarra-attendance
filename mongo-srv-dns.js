import dns from "dns";

let dnsConfigured = false;

export const configureMongoSrvDns = () => {
  if (dnsConfigured) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || "";
  if (!mongoUri.startsWith("mongodb+srv://")) {
    dnsConfigured = true;
    return;
  }

  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  dnsConfigured = true;
};
