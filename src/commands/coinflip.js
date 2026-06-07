// ─── /sp-coinflip — Flip a coin ─────────────────────────────

const SIDES = ["Heads", "Tails", "Heads", "Tails", "Heads", "Tails", "Edge! (extremely rare)"];
const EDGE_WEIGHT = 0.001; // 0.1% chance

module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-coinflip`, async ({ command, ack, respond }) => {
    await ack();

    // Weighted random: 49.95% heads, 49.95% tails, 0.1% edge
    const rand = Math.random();
    let result, emoji;
    if (rand < EDGE_WEIGHT) {
      result = "Edge! 🪙";
      emoji = "🤯";
    } else if (rand < 0.5) {
      result = "Heads";
      emoji = "👑";
    } else {
      result = "Tails";
      emoji = "🦅";
    }

    await respond({
      text: `🪙 Coin Flip: ${result}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🪙 *Coin Flip*\n\n${emoji} It's **${result}**!`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🪄 Flipped by <@${command.user_id}> · Instant (local)`,
            },
          ],
        },
      ],
    });
  });
};