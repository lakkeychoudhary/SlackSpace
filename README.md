<div align="center">
  <img src="space.png" alt="SlackSpace Logo" width="180" style="border-radius:20px;"/>
  <br/><br/>
  <h1 style="font-size:42px; margin:10px 0;">🚀 SlackSpace</h1>
  <p style="font-size:18px; color:#888; margin:8px 0;">The fastest, smartest Slack bot in the galaxy</p>
  <p style="font-size:14px; color:#666;">Built for <a href="https://stardance.hackclub.com">Hack Club Stardance</a> · Powered by <a href="https://groq.com">Groq AI</a></p>
  <br/>

  <p>
    <a href="https://github.com/lakkeychoudhary/SlackSpace/actions"><img src="https://img.shields.io/badge/Status-🟢%20Live-2EB67D.svg" alt="Status: Live"/></a>
    <a href="https://github.com/lakkeychoudhary/SlackSpace"><img src="https://img.shields.io/badge/Version-2.0.0-7C3AED.svg" alt="Version"/></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"/></a>
    <a href="https://lakkeychoudhary.github.io/SlackSpace/"><img src="https://img.shields.io/badge/Demo-Visit-36C5F0.svg" alt="Demo"/></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Commands-13-7C3AED.svg" alt="13 Commands"/>
    <img src="https://img.shields.io/badge/Host-Nest-EC3750.svg" alt="Nest"/>
    <img src="https://img.shields.io/badge/AI-Llama%203.3%2070B-2EB67D.svg" alt="AI"/>
    <img src="https://img.shields.io/badge/Node.js-24-339933.svg" alt="Node.js"/>
  </p>
</div>

<br/>

---

## 📋 Overview

SlackSpace is a feature-rich Slack bot running 24/7 on Hack Club's Nest servers. It combines utility commands, fun games, knowledge tools, and a full conversational AI assistant — all with zero downtime.

| Metric | Value |
|--------|-------|
| 🎯 Commands | 13 |
| 🧠 AI Model | Llama 3.3 70B (Groq) |
| 💬 Memory | 20 messages per user |
| ⏱ Response Time | <1ms (local), ~200ms (API) |
| 🏠 Hosting | Nest @ Hack Club |
| 🔒 Security | .env (gitignored) |

---

## 🛸 Commands

### ⚡ Utility
| Command | Description | Speed |
|---------|-------------|-------|
| `/sp-ping` | Check bot latency (nanosecond precision) | <1ms |
| `/sp-echo <msg>` | Make the bot repeat your message | <1ms |
| `/sp-whoami` | See your Slack profile info | <1ms |
| `/sp-status` | Bot health, uptime, cache & CPU stats | <1ms |

### 🎮 Fun
| Command | Description | Speed |
|---------|-------------|-------|
| `/sp-joke` | Get a random joke (API + fallback) | ~200ms |
| `/sp-8ball <q>` | Ask the Magic 8-Ball | <1ms |
| `/sp-coinflip` | Flip a coin (0.1% edge chance!) | <1ms |
| `/sp-dice [NdM]` | Roll dice — d6, d20, 2d6 supported | <1ms |

### 📚 Knowledge
| Command | Description | Speed |
|---------|-------------|-------|
| `/sp-fact` | Learn an amazing space fact (20 facts) | <1ms |
| `/sp-inspire` | Get an inspirational quote | ~200ms |
| `/sp-define <word>` | Define any English word | ~300ms |

### 🤖 AI (with Memory)
| Command | Description | Speed |
|---------|-------------|-------|
| `/sp-ask <question>` | Ask AI anything — remembers conversation | ~1-3s |
| `/sp-help` | List all commands | <1ms |

> **Pro Tip:** After using `/sp-ask`, you can DM the bot directly to continue the conversation without typing the command again!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SLACK WORKSPACE                        │
│         User types /sp-ask or sends a DM                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                  WebSocket
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               SLACKSPACE BOT (Nest Server)               │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │  Bolt     │→ │  Rate     │→ │  Command Router     │   │
│  │  Engine   │  │  Limiter  │  │  (13 handlers)      │   │
│  │  (Socket) │  │  30/min   │  │                     │   │
│  └──────────┘  └───────────┘  └────────┬───────────┘   │
│                                         │                │
│                    ┌────────────────────┼────────┐       │
│                    ▼                    ▼        ▼       │
│              ┌──────────┐    ┌──────────┐ ┌──────────┐  │
│              │ Utility  │    │   Fun    │ │ AI+Memory │  │
│              │ Commands │    │ Commands │ │ (Groq)   │  │
│              │ (local)  │    │ (local+  │ │          │  │
│              │          │    │  API)    │ │ Llama    │  │
│              └──────────┘    └──────────┘ │ 3.3 70B  │  │
│                                           └──────────┘  │
│                         │                               │
│                    ┌────▼────┐                          │
│                    │ Cache   │ SmartCache                │
│                    │ (TTL)   │ Hit rate: 90%+            │
│                    └─────────┘                          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              NEST INFRASTRUCTURE                 │    │
│  │  systemd service · auto-restart · 24/7 uptime   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
```
User ──slash command──▶ Bot ──ACK──▶ Slack (< 3 seconds required)
                                      │
                          ┌───────────┼───────────┐
                          ▼           ▼           ▼
                     Local Data   API + Cache   Groq AI
                     (< 1ms)     (~200ms)      (~1-3s)
                          │           │           │
                          └───────────┼───────────┘
                                      │
                                      ▼
                               respond() to Slack
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v20+
- A [Hack Club Slack](https://hackclub.com/slack) account
- A [Hack Club Nest](https://nest.hackclub.com) account
- A [Groq API key](https://console.groq.com) (free tier)

### Installation
```bash
git clone https://github.com/lakkeychoudhary/SlackSpace.git
cd SlackSpace
npm install
cp .env.example .env    # Fill in your tokens
npm start               # Run locally
```

### Environment Variables
```env
SLACK_BOT_TOKEN=xoxb-...     # From Slack API dashboard
SLACK_APP_TOKEN=xapp-...     # From Slack API dashboard
GROQ_API_KEY=gsk-...         # From console.groq.com
```

### Deploy to Nest (24/7)
```bash
# On Nest server:
git clone https://github.com/lakkeychoudhary/SlackSpace.git
cd SlackSpace && npm install
nano .env                    # Add your tokens
```

```ini
# /etc/systemd/system/slackspace.service
[Unit]
Description=SlackSpace Bot
After=network-online.target

[Service]
Type=simple
Restart=always
WorkingDirectory=/root/SlackSpace
ExecStart=/usr/bin/node index.js

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now slackspace.service
```

---

## 🧠 AI Features

SlackSpace includes a conversational AI powered by **Llama 3.3 70B** via Groq:

- **Context Memory** — Remembers your last 20 messages
- **Conversational** — DM the bot directly, no command needed
- **Smart Person** — Talks like a friendly Hack Club member
- **Auto-Reset** — Clears conversation after 30 min inactivity

| Feature | Details |
|---------|---------|
| Model | Llama 3.3 70B Versatile (Groq) |
| Memory | 20 messages per user |
| Timeout | 30 min inactivity |
| Max Response | 1500 chars |
| Commands | `/sp-ask`, DM, `reset`, `help` |

---

## 📁 Project Structure

```
SlackSpace/
├── index.js                 # Entry point — dynamic command loader
├── src/
│   ├── commands/
│   │   ├── commands.js      # Command registry (13 commands)
│   │   ├── ping.js          # Latency check
│   │   ├── help.js          # Command list
│   │   ├── joke.js          # Random joke (API)
│   │   ├── echo.js          # Echo utility
│   │   ├── fact.js          # Space facts (local)
│   │   ├── eightball.js     # Magic 8-Ball
│   │   ├── inspire.js       # Quotes (API)
│   │   ├── define.js        # Dictionary (API)
│   │   ├── coinflip.js      # Coin flip
│   │   ├── dice.js          # Dice roller
│   │   ├── whoami.js        # Profile info
│   │   ├── status.js        # Bot health
│   │   └── ask.js           # 🤖 AI + conversation memory
│   ├── utils/
│   │   ├── cache.js         # SmartCache with TTL
│   │   └── logger.js        # Structured logging
│   └── middleware/
│       └── ratelimit.js     # Per-user rate limiter
├── docs/
│   └── index.html           # 🌐 GitHub Pages demo site
├── .agents/                 # 🤖 AI context for future agents
│   ├── CONTEXT.md
│   ├── ARCHITECTURE.md
│   └── COMMANDS.md
├── .env.example             # Token template
├── .gitignore               # Security
├── LICENSE                  # MIT
└── README.md                # This file
```

---

## 🔒 Security

| Measure | Status |
|---------|--------|
| `.env` in `.gitignore` | ✅ Cannot be pushed to GitHub |
| Tokens never hardcoded | ✅ All via environment variables |
| API key on server only | ✅ Lives on Nest, not in repo |
| Rate limiting | ✅ 30 commands/min per user |
| Error sanitization | ✅ Logger strips token values |

---

## 🤝 Contributing

This is a personal project by **@lakkeychoudhary**.

For commit guidelines, see the [Commit Like a Human](#-commit-like-a-human) section in the repo.

---

## 📜 License

MIT © [lakkeychoudhary](https://github.com/lakkeychoudhary)

---

## 🙏 Acknowledgements

| Project | Purpose |
|---------|---------|
| [Hack Club Stardance](https://stardance.hackclub.com) | Mission & inspiration |
| [Slack Bolt JS](https://slack.dev/bolt-js) | Bot framework |
| [Groq](https://groq.com) | Free AI inference (Llama 3.3 70B) |
| [Nest @ Hack Club](https://nest.hackclub.com) | 24/7 hosting |
| [Free Dictionary API](https://dictionaryapi.dev) | Word definitions |
| [ZenQuotes](https://zenquotes.io) | Inspirational quotes |
| [Official Joke API](https://github.com/15Dkatz/official_joke_api) | Random jokes |

---

<div align="center">
  <img src="space.png" alt="SlackSpace" width="100" style="border-radius:16px;"/>
  <br/>
  <p style="color:#888;">Made with 💜 by <a href="https://github.com/lakkeychoudhary">@lakkeychoudhary</a></p>
  <p style="color:#666; font-size:12px;">Built for Hack Club Stardance 2026</p>
</div>