// ─── /sp-ask — AI-powered question answering (DeepSeek API) ────
// Ask any question and get an intelligent response

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios, cache, logger }) {
  app.command(`/${BOT_PREFIX}-ask`, async ({ command, ack, respond }) => {
    await ack();

    const question = command.text.trim();

    // No question provided — show usage
    if (!question) {
      await respond({
        text: "🤖 Ask me anything! Usage: `/sp-ask What is quantum computing?`",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: [
                `🤖 *${BOT_NAME} AI Assistant*`,
                ``,
                `❌ *Oops!* You need to ask me a question!`,
                ``,
                `*Usage:* \`/${BOT_PREFIX}-ask <your question>\``,
                ``,
                `*Examples:*`,
                `\`/${BOT_PREFIX}-ask What is quantum computing?\``,
                `\`/${BOT_PREFIX}-ask Explain recursion simply\``,
                `\`/${BOT_PREFIX}-ask Best practices for JavaScript\``,
                `\`/${BOT_PREFIX}-ask What's the meaning of life?\``,
              ].join("\n"),
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `🧠 Powered by DeepSeek AI · <@${command.user_id}>`,
              },
            ],
          },
        ],
      });
      return;
    }

    // Check if API key is configured
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      await respond({
        text: "🤖 AI is not configured yet — DEEPSEEK_API_KEY is missing.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🤖 *${BOT_NAME} AI*\n\n❌ The AI assistant is not configured. Please add \`DEEPSEEK_API_KEY\` to the server's \`.env\` file.`,
            },
          },
        ],
      });
      return;
    }

    // Show "thinking" indicator
    const startTime = Date.now();

    try {
      // Call DeepSeek API
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: [
                "You are SlackSpace, a friendly, helpful AI assistant built for the Hack Club community.",
                "You are knowledgeable about technology, coding, science, and general topics.",
                "Keep responses concise but helpful — under 1500 characters.",
                "Use emoji where appropriate.",
                "If the question is about coding, provide code examples when helpful.",
                "Be warm, enthusiastic, and encouraging — you're part of the Hack Club family!",
              ].join(" "),
            },
            {
              role: "user",
              content: question,
            },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      const answer = response.data.choices[0]?.message?.content;
      const latency = Date.now() - startTime;
      const model = response.data.model || "deepseek-chat";

      if (!answer) {
        throw new Error("No response from AI");
      }

      // Truncate if too long for Slack (max ~4000 chars)
      const truncated = answer.length > 3800
        ? answer.slice(0, 3800) + "\n\n... _(response truncated)_"
        : answer;

      // Check cache stats
      const cacheHits = cache.stats.hits;
      const cacheMisses = cache.stats.misses;

      await respond({
        text: truncated,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: truncated,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: [
                  `🧠 *${BOT_NAME} AI*`,
                  `⏱ Response: \`${latency}ms\``,
                  `🤖 Model: \`${model}\``,
                  `👤 Asked by <@${command.user_id}>`,
                ].join(" · "),
              },
            ],
          },
        ],
      });

      logger?.command?.(command.user_id, `ask (latency: ${latency}ms)`, latency);

    } catch (err) {
      const latency = Date.now() - startTime;
      logger?.error?.(`AI request failed: ${err.message}`);

      let errorMessage;
      if (err.response?.status === 429) {
        errorMessage = "⏳ Rate limit hit — too many requests. Try again in a moment!";
      } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        errorMessage = "🐢 The AI is taking too long to respond. Try a simpler question!";
      } else if (err.response?.status === 401) {
        errorMessage = "🔑 API key is invalid. Please check the DEEPSEEK_API_KEY configuration.";
      } else {
        errorMessage = "💔 Something went wrong with the AI. Please try again later!";
      }

      await respond({
        text: errorMessage,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🤖 *${BOT_NAME} AI*\n\n${errorMessage}\n\n_Troubleshooting tip: Make sure the DeepSeek API is accessible from the server._`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⏱ Failed after \`${latency}ms\` · <@${command.user_id}>`,
              },
            ],
          },
        ],
      });
    }
  });
};