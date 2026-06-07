// ─── /sp-8ball — Magic 8-Ball ──────────────────────────────

const ANSWERS = [
  { text: "Yes, definitely!", type: "positive", emoji: "✅" },
  { text: "It is certain.", type: "positive", emoji: "✅" },
  { text: "Without a doubt.", type: "positive", emoji: "✅" },
  { text: "Yes — absolutely!", type: "positive", emoji: "✅" },
  { text: "You may rely on it.", type: "positive", emoji: "✅" },
  { text: "As I see it, yes.", type: "positive", emoji: "✅" },
  { text: "Most likely.", type: "positive", emoji: "✅" },
  { text: "Outlook good.", type: "positive", emoji: "✅" },
  { text: "Signs point to yes.", type: "positive", emoji: "✅" },
  { text: "Reply hazy, try again.", type: "neutral", emoji: "🤔" },
  { text: "Ask again later.", type: "neutral", emoji: "🤔" },
  { text: "Better not tell you now.", type: "neutral", emoji: "🤔" },
  { text: "Cannot predict now.", type: "neutral", emoji: "🤔" },
  { text: "Concentrate and ask again.", type: "neutral", emoji: "🤔" },
  { text: "Don't count on it.", type: "negative", emoji: "❌" },
  { text: "My reply is no.", type: "negative", emoji: "❌" },
  { text: "My sources say no.", type: "negative", emoji: "❌" },
  { text: "Outlook not so good.", type: "negative", emoji: "❌" },
  { text: "Very doubtful.", type: "negative", emoji: "❌" },
];

module.exports = function (app, { BOT_PREFIX }) {
  app.command(`/${BOT_PREFIX}-8ball`, async ({ command, ack, respond }) => {
    await ack();

    const question = command.text.trim();
    if (!question) {
      await respond({
        text: "🔮 Ask me a question! Usage: `/sp-8ball Will I finish this project?`",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🔮 *Magic 8-Ball*\n\n❌ *Shake harder!* You need to ask a question.\n\nUsage: \`/${BOT_PREFIX}-8ball Will I finish this project?\``,
            },
          },
        ],
      });
      return;
    }

    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    const colorDot = answer.type === "positive" ? "🟢" : answer.type === "negative" ? "🔴" : "🟡";

    await respond({
      text: `🔮 "${question}" → ${answer.emoji} ${answer.text}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🔮 *The Magic 8-Ball* 🎱\n\n*Your question:* "${question}"\n\n${colorDot} *Answer:* ${answer.text}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🎱 Shaken by <@${command.user_id}> · Instant response (local) · ${ANSWERS.length} possible answers`,
            },
          ],
        },
      ],
    });
  });
};