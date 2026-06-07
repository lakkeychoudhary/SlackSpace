// ╔══════════════════════════════════════════════════════════╗
// ║                   🚀 SlackSpace Bot                      ║
// ║  The fastest Slack bot in the galaxy                    ║
// ║  Built for Hack Club Stardance                         ║
// ║  by @lakkeychoudhary                                   ║
// ╚══════════════════════════════════════════════════════════╝

require("dotenv").config();
const { App, LogLevel } = require("@slack/bolt");
const axios = require("axios");

// ─── Configuration ───────────────────────────────────────────────
const BOT_PREFIX = "sp"; // All commands start with /sp-
const BOT_NAME = "SlackSpace";
const BOT_VERSION = "1.0.0";

// Colors for Slack mrkdwn
const COLORS = {
  primary: "#36C5F0",     // Slack blue
  success: "#2EB67D",     // Slack green  
  warning: "#ECB22E",     // Slack yellow
  danger: "#E01E5A",      // Slack red
  purple: "#7C3AED",      // Purple accent
};

// ─── API Response Cache (makes bot faster!) ──────────────────────
const cache = {
  data: new Map(),
  get(key) {
    const entry = this.data.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.data.delete(key);
      return null;
    }
    return entry.value;
  },
  set(key, value, ttlMs = 60000) {
    this.data.set(key, { value, timestamp: Date.now(), ttl: ttlMs });
  }
};

// ─── Initialize Bolt App ────────────────────────────────────────
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.ERROR, // Minimal logging = faster
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 1: /sp-ping — Ultra-fast latency check
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-ping`, async ({ command, ack, respond }) => {
  const startTime = Date.now();
  await ack();

  // Get precise timing
  const parseTime = Date.now() - startTime;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { timeZone: "UTC", hour12: false });
  const dateStr = now.toISOString().split("T")[0];

  await respond({
    text: `🏓 *PONG!*`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `⚡ *PONG!* 🏓`,
            ``,
            `Latency: *${parseTime}ms* 🚀`,
            `Server Time: \`${dateStr} ${timeStr} UTC\``,
            `Channel: <#${command.channel_id}>`,
            `User: <@${command.user_id}>`,
          ].join("\n")
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🤖 ${BOT_NAME} v${BOT_VERSION} · Response time: ${parseTime}ms`
          }
        ]
      }
    ]
  });
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 2: /sp-help — List all commands
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-help`, async ({ command, ack, respond }) => {
  await ack();

  const commands = [
    { name: `${BOT_PREFIX}-ping`,    desc: "Check bot latency",                                emoji: "🏓" },
    { name: `${BOT_PREFIX}-joke`,    desc: "Get a random joke to laugh at",                    emoji: "😂" },
    { name: `${BOT_PREFIX}-fact`,    desc: "Learn an amazing space fact",                      emoji: "🌌" },
    { name: `${BOT_PREFIX}-inspire`, desc: "Get an inspirational quote",                       emoji: "💫" },
    { name: `${BOT_PREFIX}-8ball`,   desc: "Ask the magic 8-ball a question",                  emoji: "🔮" },
    { name: `${BOT_PREFIX}-echo`,    desc: "Make the bot say something",                       emoji: "📢" },
    { name: `${BOT_PREFIX}-status`,  desc: "Check bot health & uptime",                        emoji: "📊" },
    { name: `${BOT_PREFIX}-help`,    desc: "Show this help message",                           emoji: "❓" },
  ];

  const commandList = commands
    .map(c => `• \`/${c.name}\` ${c.emoji} — ${c.desc}`)
    .join("\n");

  await respond({
    text: `🚀 ${BOT_NAME} Help`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚀 ${BOT_NAME} — Available Commands`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hi <@${command.user_id}>! Here's what I can do:\n\n${commandList}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `💡 *Tip:* Use \`/${BOT_PREFIX}-echo <message>\` to make me repeat anything!`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🤖 ${BOT_NAME} v${BOT_VERSION} · Built with ❤️ by @lakkeychoudhary · 🏠 <https://github.com/lakkeychoudhary/SlackSpace|GitHub>`
          }
        ]
      }
    ]
  });
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 3: /sp-joke — Random joke from API
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-joke`, async ({ command, ack, respond }) => {
  await ack();

  try {
    // Cache jokes for 30 seconds to be fast
    let joke = cache.get("joke");
    if (!joke) {
      const response = await axios.get("https://official-joke-api.appspot.com/random_joke", {
        timeout: 5000
      });
      joke = response.data;
      cache.set("joke", joke, 30000);
    }

    await respond({
      text: `${joke.setup}\n\n${joke.punchline}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `😂 *Random Joke*\n\n*${joke.setup}*\n\n||${joke.punchline}||`  // spoiler the punchline!
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Requested by <@${command.user_id}> · 🤖 ${BOT_NAME}`
            }
          ]
        }
      ]
    });
  } catch (err) {
    // Fallback joke if API fails — bot never crashes!
    await respond({
      text: "Why did the Slack bot cross the channel? To get to the other slash! 😄"
    });
  }
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 4: /sp-fact — Random space fact
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-fact`, async ({ command, ack, respond }) => {
  await ack();

  // 🌌 Space facts — no API needed (fast & offline)
  const spaceFacts = [
    "🪐 Saturn's density is so low that it would float in water!",
    "☀️ The Sun makes up 99.86% of all mass in our solar system.",
    "🌍 A day on Venus is longer than a year on Venus.",
    "🌙 The Moon is slowly drifting away from Earth at 3.8 cm per year.",
    "🛸 There are more stars in the universe than grains of sand on Earth.",
    "⚡ A single lightning bolt on Jupiter is 1,000x more powerful than Earth's.",
    "⏰ Neutron stars can spin 600 times per second!",
    "🌌 The largest known star, UY Scuti, could fit 5 billion Suns inside it.",
    "🌠 Space is completely silent — there's no air for sound to travel through.",
    "🔴 A day on Mars is only 40 minutes longer than a day on Earth.",
    "💫 The International Space Station travels at 17,500 mph (28,000 km/h).",
    "☄️ Over 1 million Earths could fit inside the Sun!",
    "🌑 One teaspoon of neutron star material would weigh 10 million tons.",
    "🌌 The Andromeda Galaxy is on a collision course with the Milky Way — in 4.5 billion years!",
    "🧊 There's a massive cloud of water in space containing 140 trillion times Earth's oceans.",
  ];

  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

  await respond({
    text: `🌌 Space Fact: ${randomFact}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🌌 *Space Fact* 🚀\n\n${randomFact}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `✨ Requested by <@${command.user_id}> · No API needed — facts stored locally for *instant* response!`
          }
        ]
      }
    ]
  });
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 5: /sp-inspire — Inspirational quote
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-inspire`, async ({ command, ack, respond }) => {
  await ack();

  try {
    let quote = cache.get("inspire");
    if (!quote) {
      const response = await axios.get("https://zenquotes.io/api/random", {
        timeout: 5000
      });
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        quote = { text: data[0].q, author: data[0].a };
        cache.set("inspire", quote, 60000);
      }
    }

    if (quote) {
      await respond({
        text: `💫 "${quote.text}" — ${quote.author}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `💫 *Inspiration*\n\n> *“${quote.text}”*\n> — ${quote.author || "Unknown"}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `✨ Stay inspired, <@${command.user_id}>! · 🤖 ${BOT_NAME}`
              }
            ]
          }
        ]
      });
    } else {
      throw new Error("No quote data");
    }
  } catch (err) {
    // Fallback quotes — always available!
    const fallbackQuotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
      { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
      { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
      { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    ];
    const fb = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    await respond({
      text: `💫 "${fb.text}" — ${fb.author}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `💫 *Inspiration*\n\n> *“${fb.text}”*\n> — ${fb.author}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📖 *Offline mode* — API unavailable, used local quote`
            }
          ]
        }
      ]
    });
  }
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 6: /sp-8ball — Magic 8-Ball 🎱
// ════════════════════════════════════════════════════════════════
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
            text: `🔮 *Magic 8-Ball*\n\n❌ *Oops!* You need to ask a question!\n\nUsage: \`/${BOT_PREFIX}-8ball Will I finish this project?\``
          }
        }
      ]
    });
    return;
  }

  const answers = [
    "🎱 *Yes*, definitely!",
    "🎱 It is *certain*.",
    "🎱 *Without a doubt*.",
    "🎱 Yes — *absolutely*!",
    "🎱 You may *rely* on it.",
    "🎱 *As I see it*, yes.",
    "🎱 *Most likely*.",
    "🎱 Outlook *good*.",
    "🎱 Signs point to *yes*.",
    "🎱 *Reply hazy*, try again.",
    "🎱 Ask again *later*.",
    "🎱 Better not tell you *now*.",
    "🎱 Cannot *predict* now.",
    "🎱 Concentrate and ask *again*.",
    "🎱 *Don't* count on it.",
    "🎱 My reply is *no*.",
    "🎱 My sources say *no*.",
    "🎱 Outlook *not so good*.",
    "🎱 Very *doubtful*.",
  ];

  const answer = answers[Math.floor(Math.random() * answers.length)];

  await respond({
    text: `🔮 "${question}" → ${answer}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔮 *The Magic 8-Ball*\n\n*Your question:* "${question}"\n\n${answer}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🎱 Shaken by <@${command.user_id}> · *Instant* response (no API needed!)`
          }
        ]
      }
    ]
  });
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 7: /sp-echo — Echo utility
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-echo`, async ({ command, ack, respond }) => {
  await ack();

  const message = command.text.trim();
  if (!message) {
    await respond({
      text: `📢 Usage: \`/${BOT_PREFIX}-echo <message>\` — Make me say anything!`,
    });
    return;
  }

  await respond({
    text: message,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📢 *${BOT_NAME} says:*\n\n> ${message}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🗣️ Echoed by <@${command.user_id}>`
          }
        ]
      }
    ]
  });
});

// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND 8: /sp-status — Bot health & stats
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-status`, async ({ command, ack, respond }) => {
  await ack();

  const uptime = process.uptime();
  const uptimeStr = formatUptime(uptime);
  const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const nodeVersion = process.version;
  const platform = process.platform;

  await respond({
    text: `📊 ${BOT_NAME} Status — Online!`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📊 ${BOT_NAME} — System Status`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `✅ *Status:* Online & Operational`,
            ``,
            `⏱ *Uptime:* ${uptimeStr}`,
            `🧠 *Memory:* ${memory} MB`,
            `🔢 *Node.js:* ${nodeVersion}`,
            `💻 *Platform:* ${platform}`,
            `📦 *Commands:* 8 active`,
          ].join("\n")
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🤖 ${BOT_NAME} v${BOT_VERSION} · Built for Hack Club Stardance 🚀`
          }
        ]
      }
    ]
  });
});

// ─── Utility: Format uptime ──────────────────────────────────────
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

// ─── Global error handler — bot NEVER crashes ───────────────────
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err.message);
});

// ════════════════════════════════════════════════════════════════
//  🚀 START THE BOT
// ════════════════════════════════════════════════════════════════
(async () => {
  try {
    await app.start();
    console.log(`
╔════════════════════════════════════════════╗
║          🚀 ${BOT_NAME} BOT            ║
║                                           ║
║  Status: ✅ Online & Ready               ║
║  Mode:   📡 Socket Mode                  ║
║  Prefix: /${BOT_PREFIX}-                    ║
║  Commands: 8 available                    ║
║                                           ║
║  Built for Hack Club Stardance 🌟        ║
║  by @lakkeychoudhary                     ║
╚════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error("🚨 Failed to start bot:", err.message);
    console.error("\n❌ Make sure your .env file has the correct tokens!");
    console.error("   See .env.example for instructions.\n");
    process.exit(1);
  }
})();