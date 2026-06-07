// ─── /sp-define — Define a word using API ───────────────────

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios }) {
  app.command(`/${BOT_PREFIX}-define`, async ({ command, ack, respond }) => {
    await ack();

    const word = command.text.trim().toLowerCase();
    if (!word) {
      await respond({
        text: `📖 Usage: \`/${BOT_PREFIX}-define <word>\` — Define any English word!`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📖 *Dictionary*\n\n❌ You need to give me a word to define!\n\nUsage: \`/${BOT_PREFIX}-define serendipity\``,
            },
          },
        ],
      });
      return;
    }

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
        timeout: 5000,
      });

      const data = res.data[0];
      if (!data) throw new Error("No definition found");

      const wordName = data.word;
      const phonetic = data.phonetic || "";
      const meanings = data.meanings.slice(0, 3); // Max 3 meanings

      const definitionText = meanings
        .map((m, i) => {
          const defs = m.definitions.slice(0, 2)
            .map(d => `• ${d.definition}${d.example ? `\n  *“${d.example}”*` : ""}`)
            .join("\n");
          return `*${i + 1}. ${m.partOfSpeech}*\n${defs}`;
        })
        .join("\n\n");

      await respond({
        text: `📖 ${wordName}: ${phonetic ? `(${phonetic})` : ""}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📖 *${wordName}* ${phonetic ? `(${phonetic})` : ""}\n\n${definitionText}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `🔍 Requested by <@${command.user_id}> · API: Free Dictionary API`,
              },
            ],
          },
        ],
      });
    } catch (err) {
      if (err.response?.status === 404) {
        await respond({
          text: `📖 Could not find "${word}"`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `📖 *Dictionary*\n\n❌ Sorry, I couldn't find a definition for **"${word}"**.\n\nMaybe check the spelling? 🤔`,
              },
            },
          ],
        });
      } else {
        await respond({
          text: `📖 Sorry, the dictionary service is unavailable right now.`,
        });
      }
    }
  });
};