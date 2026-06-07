// ─── /sp-ping — Ultra-fast latency check ─────────────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME, BOT_VERSION }) {
  app.command(`/${BOT_PREFIX}-ping`, async ({ command, ack, respond }) => {
    const startTime = process.hrtime.bigint();
    await ack();
    const endTime = process.hrtime.bigint();
    const latencyNs = Number(endTime - startTime);
    const latencyUs = (latencyNs / 1000).toFixed(1);
    const latencyMs = (latencyNs / 1_000_000).toFixed(1);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { timeZone: "UTC", hour12: false });
    const dateStr = now.toISOString().split("T")[0];

    await respond({
      text: `🏓 PONG! (${latencyMs}ms)`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `⚡ *PONG!* 🏓`,
              ``,
              `⏱ *Latency:* \`${latencyMs}ms\` (${latencyUs}μs) 🚀`,
              `🕐 *Server:* \`${dateStr} ${timeStr} UTC\``,
              `📡 *Channel:* <#${command.channel_id}>`,
              `👤 *User:* <@${command.user_id}>`,
            ].join("\n"),
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 ${BOT_NAME} v${BOT_VERSION} · Measured with nanosecond precision`,
            },
          ],
        },
      ],
    });
  });
};