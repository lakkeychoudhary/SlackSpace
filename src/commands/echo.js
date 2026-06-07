// ─── /sp-echo — Echo utility ────────────────────────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-echo`, async ({ command, ack, respond }) => {
    await ack();

    const message = command.text.trim();
    if (!message) {
      await respond({
        text: `📢 Usage: \`/${BOT_PREFIX}-echo <message>\` — Make me say anything!`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📢 *${BOT_NAME} Echo*\n\n❌ You didn't give me anything to say!\n\nUsage: \`/${BOT_PREFIX}-echo Hello world!\``,
            },
          },
        ],
      });
      return;
    }

    await respond({
      text: message,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📢 *${BOT_NAME} says:*\n\n> ${message}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🗣️ Echoed by <@${command.user_id}> in <#${command.channel_id}>`,
            },
          ],
        },
      ],
    });
  });
};