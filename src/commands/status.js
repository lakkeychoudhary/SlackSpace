// ─── /sp-status — Comprehensive bot health & metrics ────────

const os = require("os");

module.exports = function (app, { BOT_PREFIX, BOT_NAME, BOT_VERSION, cache, rateLimiter }) {
  app.command(`/${BOT_PREFIX}-status`, async ({ command, ack, respond }) => {
    await ack();

    const uptime = process.uptime();
    const uptimeStr = formatUptime(uptime);
    const memoryMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const rssMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const cpuCores = os.cpus().length;
    const loadAvg = os.loadavg()[0]?.toFixed(2) || "N/A";
    const nodeVer = process.version;
    const platform = os.platform();
    const hostname = os.hostname();
    const cacheStats = cache.stats;
    const rateStats = rateLimiter.stats;

    await respond({
      text: `📊 ${BOT_NAME} Status — Online!`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `📊 ${BOT_NAME} — System Status` },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `✅ *Status:* Online & Operational`,
              ``,
              `⏱ *Uptime:* \`${uptimeStr}\``,
              `🧠 *Memory:* \`${memoryMB} MB\` (RSS: \`${rssMB} MB\`)`,
              `💻 *CPU:* \`${cpuCores}\` cores · Load: \`${loadAvg}\``,
              `🖥 *Host:* \`${hostname}\` · \`${platform}\``,
              `🔢 *Node.js:* \`${nodeVer}\``,
              ``,
              `📦 *Cache:* \`${cacheStats.size}\` entries · Hit rate: \`${cacheStats.hitRate}\``,
              `👥 *Active users:* \`${rateStats.activeUsers}\``,
            ].join("\n"),
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 ${BOT_NAME} v${BOT_VERSION} · Built for Hack Club Stardance 🚀 by @lakkeychoudhary`,
            },
          ],
        },
      ],
    });
  });
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}