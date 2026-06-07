// ╔══════════════════════════════════════════════════════════╗
// ║               🚀 SlackSpace Bot                        ║
// ║  The fastest, most intelligent Slack bot in the galaxy  ║
// ║  Built for Hack Club Stardance                         ║
// ║  by @lakkeychoudhary                                   ║
// ╚══════════════════════════════════════════════════════════╝

require("dotenv").config();
const { App, LogLevel } = require("@slack/bolt");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// ─── Import Internal Modules ─────────────────────────────────────
const { logger } = require("./src/utils/logger");
const { SmartCache } = require("./src/utils/cache");
const { RateLimiter } = require("./src/middleware/ratelimit");
const { commands, BOT_PREFIX } = require("./src/commands/commands");

// ─── Configuration ───────────────────────────────────────────────
const BOT_NAME = "SlackSpace";
const BOT_VERSION = "2.0.0";

// ─── Initialize Services ─────────────────────────────────────────
const cache = new SmartCache({ ttl: 60000 });
const rateLimiter = new RateLimiter({
  maxCommands: 30,   // 30 commands per minute per user
  windowMs: 60000,   // 1 minute window
  cooldownMs: 500,   // 500ms between commands
});

// ─── Bootstrap Bolt ──────────────────────────────────────────────
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.ERROR,
});

// ─── Shared Context for Commands ─────────────────────────────────
const ctx = {
  BOT_PREFIX,
  BOT_NAME,
  BOT_VERSION,
  axios,
  cache,
  rateLimiter,
  commands,
  logger,
};

// ─── Load All Commands Dynamically ───────────────────────────────
let loadedCount = 0;
for (const cmd of commands) {
  try {
    const handlerPath = path.join(__dirname, "src", "commands", path.basename(cmd.handler));
    if (fs.existsSync(handlerPath)) {
      const handler = require(handlerPath);
      handler(app, ctx);
      loadedCount++;
      logger.debug(`Loaded command: /${cmd.name}`);
    } else {
      logger.warn(`Command handler not found: ${handlerPath}`);
    }
  } catch (err) {
    logger.error(`Failed to load command /${cmd.name}`, { error: err.message });
  }
}

// ─── Global Rate Limiting Middleware ─────────────────────────────
app.use(async ({ payload, next }) => {
  const userId = payload.user_id || payload.user || "unknown";
  const result = rateLimiter.check(userId);

  if (!result.allowed) {
    // Silently ignore rate-limited requests
    // Slack will show "This app didn't respond" which is fine
    return;
  }

  await next();
});

// ─── Global Error Handlers — Bot NEVER crashes ──────────────────
process.on("unhandledRejection", (err) => {
  logger.error("🚨 Unhandled Rejection", { error: err.message });
});

process.on("uncaughtException", (err) => {
  logger.error("🚨 Uncaught Exception", { error: err.message });
});

// ─── Graceful Shutdown ───────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`Received ${signal} — shutting down gracefully...`);
  try {
    await app.stop();
    cache.destroy();
    rateLimiter.destroy();
    logger.info("✅ Shutdown complete");
  } catch (err) {
    logger.error("Error during shutdown", { error: err.message });
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ════════════════════════════════════════════════════════════════
//  🚀 LAUNCH
// ════════════════════════════════════════════════════════════════
(async () => {
  try {
    await app.start();
    logger.info(`
╔════════════════════════════════════════════╗
║          🚀 ${BOT_NAME} BOT v${BOT_VERSION}        ║
║                                           ║
║  Status: ✅ Online & Ready               ║
║  Mode:   📡 Socket Mode                  ║
║  Prefix: /${BOT_PREFIX}-                    ║
║  Commands: ${String(loadedCount).padStart(2)} loaded (${commands.length} registered)  ║
║  Cache:  ✅ Active                       ║
║  Rate Limit: ✅ Active                   ║
║                                           ║
║  Built for Hack Club Stardance 🌟        ║
║  by @lakkeychoudhary                     ║
╚════════════════════════════════════════════╝
    `);
  } catch (err) {
    logger.error("🚨 Failed to start bot", { error: err.message });
    logger.error("   ❌ Make sure your .env file has the correct tokens!");
    logger.error("   ❌ See .env.example for instructions.");
    process.exit(1);
  }
})();