// ─── Command Registry ─────────────────────────────────────────────
// Central registry of all commands with metadata

const BOT_PREFIX = "sp";

const commands = [
  // ── Utility ────────────────────────────────────────
  {
    name: `${BOT_PREFIX}-ping`,
    description: "Check bot latency & response time",
    emoji: "🏓",
    category: "Utility",
    handler: "./ping.js",
  },
  {
    name: `${BOT_PREFIX}-echo`,
    description: "Make the bot say something",
    emoji: "📢",
    category: "Utility",
    handler: "./echo.js",
  },
  {
    name: `${BOT_PREFIX}-status`,
    description: "Check bot health, uptime & cache stats",
    emoji: "📊",
    category: "Utility",
    handler: "./status.js",
  },
  {
    name: `${BOT_PREFIX}-whoami`,
    description: "See your Slack profile info",
    emoji: "👤",
    category: "Utility",
    handler: "./whoami.js",
  },

  // ── Fun ────────────────────────────────────────────
  {
    name: `${BOT_PREFIX}-joke`,
    description: "Get a random joke (cached)",
    emoji: "😂",
    category: "Fun",
    handler: "./joke.js",
  },
  {
    name: `${BOT_PREFIX}-8ball`,
    description: "Ask the Magic 8-Ball a question",
    emoji: "🔮",
    category: "Fun",
    handler: "./eightball.js",
  },
  {
    name: `${BOT_PREFIX}-coinflip`,
    description: "Flip a coin — heads or tails",
    emoji: "🪙",
    category: "Fun",
    handler: "./coinflip.js",
  },
  {
    name: `${BOT_PREFIX}-dice`,
    description: "Roll a dice (1-6 or custom N)",
    emoji: "🎲",
    category: "Fun",
    handler: "./dice.js",
  },

  // ── Knowledge ──────────────────────────────────────
  {
    name: `${BOT_PREFIX}-fact`,
    description: "Learn an amazing space fact",
    emoji: "🌌",
    category: "Knowledge",
    handler: "./fact.js",
  },
  {
    name: `${BOT_PREFIX}-inspire`,
    description: "Get an inspirational quote",
    emoji: "💫",
    category: "Knowledge",
    handler: "./inspire.js",
  },
  {
    name: `${BOT_PREFIX}-define`,
    description: "Define a word or term",
    emoji: "📖",
    category: "Knowledge",
    handler: "./define.js",
  },

  // ── AI ──────────────────────────────────────────────
  {
    name: `${BOT_PREFIX}-ask`,
    description: "Ask AI any question (DeepSeek powered)",
    emoji: "🤖",
    category: "AI",
    handler: "./ask.js",
  },

  // ── Help ───────────────────────────────────────────
  {
    name: `${BOT_PREFIX}-help`,
    description: "Show all available commands",
    emoji: "❓",
    category: "Help",
    handler: "./help.js",
  },
];

module.exports = { commands, BOT_PREFIX };