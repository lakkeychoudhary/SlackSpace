// ─── /sp-dice — Roll dice ───────────────────────────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-dice`, async ({ command, ack, respond }) => {
    await ack();

    let sides = 6;
    let count = 1;
    const text = command.text.trim();

    // Parse "NdM" format (e.g., "2d20", "3d6") or just a number
    const match = text.match(/^(\d+)?d(\d+)$/i);
    if (match) {
      count = parseInt(match[1]) || 1;
      sides = parseInt(match[2]);
    } else if (text && !isNaN(parseInt(text))) {
      sides = parseInt(text);
    }

    // Clamp values
    count = Math.max(1, Math.min(10, count));
    sides = Math.max(2, Math.min(100, sides));

    const rolls = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    let responseText;
    if (count === 1) {
      responseText = `🎲 You rolled a **${total}** (d${sides})`;
    } else {
      responseText = `🎲 You rolled **${rolls.join(", ")}** = *${total}* (${count}d${sides})`;
    }

    await respond({
      text: `🎲 Dice: ${total}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎲 *Dice Roll*\n\n${responseText}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🎲 Rolled by <@${command.user_id}> · Instant (local)`,
            },
          ],
        },
      ],
    });
  });
};