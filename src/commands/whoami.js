// ─── /sp-whoami — Show your Slack profile info ──────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-whoami`, async ({ command, ack, respond }) => {
    await ack();

    await respond({
      text: `👤 Your Slack profile info`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `👤 *Who Am I?*`,
              ``,
              `🧑 *User:* <@${command.user_id}>`,
              `🆔 *User ID:* \`${command.user_id}\``,
              `📡 *Channel:* <#${command.channel_id}>`,
              `🏷 *Channel ID:* \`${command.channel_id}\``,
              `🏢 *Team:* \`${command.team_id}\``,
              `🔗 *Trigger:* \`${command.command}\``,
            ].join("\n"),
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 ${BOT_NAME} · Instant (local data)`,
            },
          ],
        },
      ],
    });
  });
};