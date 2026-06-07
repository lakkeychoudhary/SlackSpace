// ─── /sp-help — List all commands ─────────────────────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME, BOT_VERSION, commands }) {
  app.command(`/${BOT_PREFIX}-help`, async ({ command, ack, respond }) => {
    await ack();

    // Group commands by category
    const categories = {};
    for (const cmd of commands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd);
    }

    const categoryOrder = ["Utility", "Fun", "Knowledge", "Help"];
    const sections = categoryOrder
      .filter(cat => categories[cat])
      .map(cat => {
        const cmdList = categories[cat]
          .map(c => `• \`/${c.name}\` ${c.emoji} — ${c.description}`)
          .join("\n");
        return `*${cat}*\n${cmdList}`;
      })
      .join("\n\n");

    const totalCommands = commands.length;

    await respond({
      text: `🚀 ${BOT_NAME} — ${totalCommands} Commands Available`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚀 ${BOT_NAME} — Available Commands (${totalCommands})`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey <@${command.user_id}>! Here's everything I can do:\n\n${sections}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `💡 *Tip:* Use \`/${BOT_PREFIX}-echo <msg>\` to make me repeat you!`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 ${BOT_NAME} v${BOT_VERSION} · ${totalCommands} commands · Built with ❤️ by @lakkeychoudhary`,
            },
          ],
        },
      ],
    });
  });
};