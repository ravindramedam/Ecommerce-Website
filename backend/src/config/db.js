const dns = require("dns");
const mongoose = require("mongoose");

const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"];

function isSrvDnsFailure(error) {
  return error && (error.syscall === "querySrv" || String(error.message).includes("querySrv"));
}

// mongodb+srv needs an SRV lookup. When the process DNS server refuses that
// query, resolve it with a private resolver. This does not call dns.setServers(),
// so other network calls in this process keep using the system DNS.
async function expandSrvUri(uri, resolver) {
  const parsed = new URL(uri);
  const records = await resolver.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
  const txt = await resolver.resolveTxt(parsed.hostname);
  const txtParams = new URLSearchParams(txt.flat().join(""));

  const hosts = records
    .map((record) => `${record.name.replace(/\.$/, "")}:${record.port}`)
    .join(",");
  const auth = parsed.username
    ? `${encodeURIComponent(decodeURIComponent(parsed.username))}:${encodeURIComponent(decodeURIComponent(parsed.password))}@`
    : "";

  const params = new URLSearchParams(parsed.search);
  for (const [key, value] of txtParams) {
    if (!params.has(key)) params.set(key, value);
  }
  if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");

  const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
  return `mongodb://${auth}${hosts}${path}?${params.toString()}`;
}

function lookupWith(resolver) {
  return (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    const family = options && options.family;
    const all = options && options.all;
    const finish = (addresses, addressFamily) => {
      if (!addresses.length) {
        callback(Object.assign(new Error(`ENODATA ${hostname}`), { code: "ENODATA" }));
        return;
      }
      if (all) {
        callback(null, addresses.map((address) => ({ address, family: addressFamily })));
        return;
      }
      callback(null, addresses[0], addressFamily);
    };

    const resolve4 = () => resolver.resolve4(hostname).then((addresses) => finish(addresses, 4));
    const resolve6 = () => resolver.resolve6(hostname).then((addresses) => finish(addresses, 6));
    const selected = family === 6 ? resolve6() : resolve4().catch(() => (family === 4 ? Promise.reject() : resolve6()));

    selected.catch((error) => callback(error));
  };
}

function applyDatabaseName(uri) {
  const dbName = process.env.DB_NAME;
  if (!uri || !dbName) return uri;

  const parsed = new URL(uri);
  if (parsed.pathname && parsed.pathname !== "/") return uri;

  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

const connectDB = async () => {
  const uri = applyDatabaseName(process.env.MONGO_URI);
  
  try {
    try {
      await mongoose.connect(uri, {});
    } catch (error) {
      if (!isSrvDnsFailure(error) || !String(uri).startsWith("mongodb+srv://")) {
        throw error;
      }

      await mongoose.disconnect().catch(() => {});
      const resolver = new dns.promises.Resolver();
      resolver.setServers(PUBLIC_DNS);
      await mongoose.connect(await expandSrvUri(uri, resolver), {
        lookup: lookupWith(resolver),
      });
    }

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
