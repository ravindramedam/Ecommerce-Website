const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const servers = dns.getServers();
    if (servers.every((server) => server === "127.0.0.1" || server === "::1")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }

    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
