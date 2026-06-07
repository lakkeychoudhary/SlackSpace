// ─── /sp-inspire — Inspirational quote with caching & fallback ─

const FALLBACKS = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger Dijkstra" },
];

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios, cache }) {
  app.command(`/${BOT_PREFIX}-inspire`, async ({ command, ack, respond }) => {
    await ack();

    let quote;
    let offline = false;

    try {
      quote = await cache.fetch("inspire", async () => {
        const res = await axios.get("https://zenquotes.io/api/random", { timeout: 4000 });
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          return { text: data[0].q, author: data[0].a };
        }
        throw new Error("Invalid response");
      }, 60000);
    } catch (err) {
      // Use fallback
      const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      quote = fb;
      offline = true;
    }

    if (!quote) {
      const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      quote = fb;
      offline = true;
    }

    await respond({
      text: `💫 "${quote.text}" — ${quote.author}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `💫 *Inspiration*\n\n> *“${quote.text}”*\n> — ${quote.author || "Unknown"}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: offline
                ? `📖 Offline mode — local quote · <@${command.user_id}>`
                : `✨ Stay inspired, <@${command.user_id}>! · Cached 60s ⚡`,
            },
          ],
        },
      ],
    });
  });
};