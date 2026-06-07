// ─── /sp-joke — Random joke with caching & fallback ─────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios, cache }) {
  app.command(`/${BOT_PREFIX}-joke`, async ({ command, ack, respond }) => {
    await ack();

    try {
      const joke = await cache.fetch(
        "joke",
        async () => {
          const res = await axios.get("https://official-joke-api.appspot.com/random_joke", {
            timeout: 4000,
          });
          return res.data;
        },
        30000 // 30s cache
      );

      await respond({
        text: `${joke.setup}\n\n${joke.punchline}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `😂 *Random Joke*\n\n*${joke.setup}*\n\n||${joke.punchline}||`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Requested by <@${command.user_id}> · 🤖 ${BOT_NAME} · Cached for 30s ⚡`,
              },
            ],
          },
        ],
      });
    } catch (err) {
      // Offline fallback — bot never dies
      const fallbacks = [
        { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs! 🐛" },
        { setup: "What's a computer's favorite snack?", punchline: "Microchips! 🍟" },
        { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache! 💰" },
        { setup: "How many programmers does it take to change a light bulb?", punchline: "None — that's a hardware problem! 💡" },
        { setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't know how to 'null' his feelings! 😢" },
      ];
      const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      await respond({
        text: `${fb.setup}\n\n${fb.punchline}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `😂 *Random Joke* (offline mode)\n\n*${fb.setup}*\n\n||${fb.punchline}||`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `📡 API unavailable — used local fallback · Requested by <@${command.user_id}>`,
              },
            ],
          },
        ],
      });
    }
  });
};