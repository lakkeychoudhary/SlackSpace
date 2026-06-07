// ─── /sp-ask — AI-powered question answering (Groq API) ────
// Ask any question and get an intelligent response

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios, cache, logger }) {
  app.command(`/${BOT_PREFIX}-ask`, async ({ command, ack, respond }) => {
    await ack();

    const question = command.text.trim();

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
                text: `🧠 Powered by Llama 3.3 70B (Groq) · <@${command.user_id}>`,
              },
            ],
          },
        ],
      });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      await respond({
        text: "🤖 AI is not configured yet — GROQ_API_KEY is missing.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🤖 *${BOT_NAME} AI*\n\n❌ AI assistant not configured. Add \`GROQ_API_KEY\` to server \`.env\`.`,
            },
          },
        ],
      });
      return;
    }

    const startTime = Date.now();

    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: [
                "You are SlackSpace, a friendly AI assistant built for the Hack Club community by @lakkeychoudhary.",
                "You are knowledgeable about technology, coding, science, and general topics.",
                "Keep responses concise but helpful — under 1500 characters.",
                "Use emoji where appropriate.",
                "If the question is about coding, provide code examples when helpful.",
                "Be warm, enthusiastic, and encouraging!",
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
      const model = response.data.model || "llama-3.3-70b-versatile";

      if (!answer) {
        throw new Error("No response from AI");
      }

      const truncated = answer.length > 3800
        ? answer.slice(0, 3800) + "\n\n... _(response truncated)_"
        : answer;

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
                  `⏱ \`${latency}ms\``,
                  `🤖 \`${model}\``,
                  `👤 <@${command.user_id}>`,
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
        errorMessage = "🐢 The AI took too long. Try a simpler question!";
      } else if (err.response?.status === 401) {
        errorMessage = "🔑 API key is invalid. Check GROQ_API_KEY config.";
      } else if (err.response?.status === 402) {
        errorMessage = "💳 Insufficient API credits. Please check your Groq account balance.";
      } else {
        errorMessage = `💔 Something went wrong: ${err.message}`;
      }

      await respond({
        text: errorMessage,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🤖 *${BOT_NAME} AI*\n\n${errorMessage}`,
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