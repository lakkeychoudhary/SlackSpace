// ─── /sp-ask — AI-powered conversation with memory ────────────
// Conversational AI that remembers context per user

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// In-memory conversation history per user (keyed by user_id)
const conversations = new Map();
const CONVERSATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY = 20; // Keep last 20 messages

// Clean up stale conversations every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, conv] of conversations) {
    if (now - conv.lastActive > CONVERSATION_TIMEOUT) {
      conversations.delete(userId);
    }
  }
}, 5 * 60 * 1000);

function getConversation(userId) {
  if (!conversations.has(userId)) {
    conversations.set(userId, {
      messages: [],
      lastActive: Date.now(),
    });
  }
  return conversations.get(userId);
}

function addMessage(userId, role, content) {
  const conv = getConversation(userId);
  conv.messages.push({ role, content });
  conv.lastActive = Date.now();
  // Keep only last N messages to avoid token limits
  if (conv.messages.length > MAX_HISTORY) {
    conv.messages = conv.messages.slice(-MAX_HISTORY);
  }
}

function clearConversation(userId) {
  conversations.delete(userId);
}

// System prompt for the AI
const SYSTEM_PROMPT = `You are SlackSpace, a friendly, intelligent AI assistant built for the Hack Club community by @lakkeychoudhary.

PERSONALITY:
- You're like a helpful friend, not a robotic assistant
- Use emoji naturally but don't overdo it
- Be warm, enthusiastic, and encouraging
- You're part of the Hack Club family
- You remember our conversation and refer back to earlier messages
- Keep responses concise but helpful (under 1500 characters)
- Use markdown formatting for code and emphasis

KNOWLEDGE:
- Technology, coding, science, math, general topics
- JavaScript, Python, HTML/CSS, APIs, web development
- Space, physics, math, programming concepts
- Life advice, career guidance, study tips

BEHAVIOR:
- If someone asks a follow-up question, reference the earlier context
- If someone says "thanks" or "cool", respond naturally like a friend
- If someone asks about coding, provide examples when helpful
- If someone shares something personal, be supportive
- Keep track of the conversation and build on previous messages`;

module.exports = function (app, { BOT_PREFIX, BOT_NAME, axios, cache, logger }) {
  // ─── Slash Command: /sp-ask ─────────────────────────────
  app.command(`/${BOT_PREFIX}-ask`, async ({ command, ack, respond }) => {
    await ack();

    const userId = command.user_id;
    const question = command.text.trim();

    if (!question) {
      await respond({
        text: `🤖 Ask me anything! Usage: \`/${BOT_PREFIX}-ask <question>\``,
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
                ``,
                `💡 *Tip:* Once you start talking to me, I remember our conversation! Just mention me or DM me to continue chatting without using the command again.`,
              ].join("\n"),
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `🧠 Powered by Llama 3.3 70B (Groq) · <@${userId}>`,
              },
            ],
          },
        ],
      });
      return;
    }

    await handleAIRequest(userId, question, respond, BOT_NAME, axios, logger);
  });

  // ─── DM Messages: Reply to direct messages ───────────────
  app.message(async ({ message, say }) => {
    // Skip bot's own messages
    if (message.subtype || message.bot_id) return;

    const userId = message.user;
    const text = message.text || "";

    // Only respond to DMs (channel type "im")
    if (message.channel_type !== "im") return;

    // Check if it's a command (skip if so, handled by slash command)
    if (text.startsWith("/")) return;

    // Handle conversation commands
    const lowerText = text.toLowerCase().trim();
    if (lowerText === "clear" || lowerText === "reset" || lowerText === "forget") {
      clearConversation(userId);
      await say({
        text: "🧠 Conversation cleared! Fresh start.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🧠 *Conversation cleared!* Fresh start. Ask me anything!`,
            },
          },
        ],
      });
      return;
    }

    if (lowerText === "help" || lowerText === "?") {
      await say({
        text: "🤖 SlackSpace AI - Help",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: [
                `🤖 *${BOT_NAME} AI - Quick Help*`,
                ``,
                `💬 *Just talk to me!* Ask anything and I'll remember our conversation.`,
                `🔄 *Type \`reset\`* to clear conversation history.`,
                `❓ *Type \`help\`* for this message.`,
                ``,
                `*Examples:*`,
                `"What is Python?"`,
                `"Tell me a joke"`,
                `"How do I learn coding?"`,
                `"What did I ask about earlier?"`,
              ].join("\n"),
            },
          },
        ],
      });
      return;
    }

    // Regular message — treat as AI question with context
    await handleAIRequest(userId, text, say, BOT_NAME, axios, logger);
  });
};

// ─── Shared AI Request Handler ─────────────────────────────
async function handleAIRequest(userId, question, respondFn, BOT_NAME, axios, logger) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    await respondFn({
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

  // Add user message to conversation history
  addMessage(userId, "user", question);

  const startTime = Date.now();

  try {
    // Build conversation context
    const conv = getConversation(userId);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conv.messages.slice(-10), // Last 10 messages for context
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages,
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

    // Add assistant response to conversation history
    addMessage(userId, "assistant", answer);

    const truncated = answer.length > 3800
      ? answer.slice(0, 3800) + "\n\n... _(response truncated)_"
      : answer;

    await respondFn({
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
                `💬 \`${conv.messages.length} msgs\``,
                `👤 <@${userId}>`,
              ].join(" · "),
            },
          ],
        },
      ],
    });

    logger?.command?.(userId, `ask (latency: ${latency}ms)`, latency);

  } catch (err) {
    const latency = Date.now() - startTime;
    // Remove the user message if AI failed (so history stays clean)
    const conv = getConversation(userId);
    conv.messages.pop();
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

    await respondFn({
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
              text: `⏱ Failed after \`${latency}ms\` · <@${userId}>`,
            },
          ],
        },
      ],
    });
  }
}

module.exports.getConversation = getConversation;
module.exports.clearConversation = clearConversation;