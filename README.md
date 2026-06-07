# 🚀 SlackSpace Bot

> The fastest Slack bot in the galaxy. Built for [Hack Club Stardance](https://stardance.hackclub.com).

[![Built for Hack Club](https://img.shields.io/badge/Built%20for-Hack%20Club%20Stardance-EC3750.svg)](https://stardance.hackclub.com)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Made by](https://img.shields.io/badge/Made%20by-%40lakkeychoudhary-7C3AED.svg)](https://github.com/lakkeychoudhary)

---

## 🎯 Features

- ⚡ **Blazing fast** — Response caching, minimal logging, local data
- 🤖 **8 commands** — ping, joke, fact, inspire, 8ball, echo, status, help
- 🛡️ **Bulletproof** — Global error handlers, fallbacks for every API command
- 📡 **Socket Mode** — No public URL needed, connects directly via WebSocket
- 🏠 **24/7 hosting** — Deploy to Hack Club Nest with systemd
- 🌌 **Space themed** — Facts, inspiration, and galactic vibes

## 🛸 Commands

| Command | Description | Category |
|---|---|---|
| `/sp-ping` | Check bot latency (with timestamp) | Utility |
| `/sp-help` | List all available commands | Help |
| `/sp-joke` | Get a random joke (API) | Fun |
| `/sp-fact` | Learn an amazing space fact (local) | Education |
| `/sp-inspire` | Get an inspirational quote | Motivation |
| `/sp-8ball` | Ask the Magic 8-Ball a question | Fun |
| `/sp-echo <msg>` | Make the bot repeat your message | Utility |
| `/sp-status` | Check bot health, uptime & memory | Info |

> **Prefix:** All commands use the `/sp-` prefix (SP = SlackSpace) to avoid collisions with other bots in the Hack Club workspace.

## 📋 Prerequisites

- [Node.js](https://nodejs.org) v18+ installed
- A [Hack Club Slack](https://hackclub.com/slack) account
- A [GitHub](https://github.com) account
- A [Nest](https://nest.hackclub.com) account (for 24/7 hosting)
- VS Code (recommended)

## 🔧 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/lakkeychoudhary/SlackSpace.git
cd SlackSpace
npm install
```

### 2. Get Your Slack Tokens

You need **two tokens** from the Slack API dashboard:

#### Token 1: Bot User OAuth Token (`xoxb-...`)
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it `SlackSpace` and select the Hack Club workspace
4. In left sidebar, go to **Socket Mode** → toggle **Enable Socket Mode** ON
5. Go to **Basic Information** → **App-Level Tokens** → **Generate Token**
   - Name it: `slackspace-socket`
   - Scope: `connections:write`
   - Copy the token (starts with `xapp-`)
6. Go to **OAuth & Permissions** → **Bot Token Scopes** → Add these scopes:
   - `chat:write`
   - `commands`
   - `app_mentions:read`
   - `channels:history`
7. Go to **Install App** → **Install to Workspace** → **Allow**
8. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

#### Token 2: App-Level Token (`xapp-...`)
Already generated in step 5 above.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and paste your tokens:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_APP_TOKEN=xapp-your-app-token-here
```

### 4. Add Slash Commands in Slack Dashboard

For each command below, go to your app's **Slash Commands** page and click **Create New Command**:

| Command | Description | Usage Hint |
|---|---|---|
| `/sp-ping` | Check bot latency | `/sp-ping` |
| `/sp-help` | List all commands | `/sp-help` |
| `/sp-joke` | Get a random joke | `/sp-joke` |
| `/sp-fact` | Get a space fact | `/sp-fact` |
| `/sp-inspire` | Get inspired | `/sp-inspire` |
| `/sp-8ball` | Ask the 8-ball | `/sp-8ball Will I ace this?` |
| `/sp-echo` | Make me say something | `/sp-echo Hello world!` |
| `/sp-status` | Bot health check | `/sp-status` |

### 5. Run Locally

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║          🚀 SLACKSPACE BOT            ║
║                                           ║
║  Status: ✅ Online & Ready               ║
║  Mode:   📡 Socket Mode                  ║
║  Prefix: /sp-                    ║
║  Commands: 8 available                    ║
╚════════════════════════════════════════════╝
```

Test it! Type `/sp-ping` in any Slack channel.

---

## 🏠 Deploy to Nest (24/7 Hosting)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: SlackSpace Bot 🚀"
git branch -M main
git push -u origin main
```

### 2. SSH into Nest

```bash
ssh your-username@your-nest-server
```

### 3. Install Dependencies (first time only)

```bash
apt update
apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
```

### 4. Clone & Setup

```bash
git clone https://github.com/lakkeychoudhary/SlackSpace.git
cd SlackSpace
npm install
nano .env   # Paste your tokens
```

Test it:
```bash
node index.js
```

Press `Ctrl+C` after testing.

### 5. Create systemd Service

```bash
nano /etc/systemd/system/slackspace.service
```

Paste:
```ini
[Unit]
Description=SlackSpace Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Restart=always
WorkingDirectory=/root/SlackSpace
ExecStart=/usr/bin/node index.js
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`), then:

```bash
systemctl daemon-reload
systemctl enable --now slackspace.service
```

### 6. Check Logs

```bash
journalctl --user -u slackspace.service -f
```

### 7. Lifecycle Commands

```bash
systemctl start slackspace.service    # Start
systemctl stop slackspace.service     # Stop
systemctl restart slackspace.service  # Restart
systemctl status slackspace.service   # Status
```

---

## 🛡️ Architecture

```
┌─────────────┐     WebSocket     ┌──────────────┐
│   Slack     │ ◄──────────────►  │  SlackSpace   │
│  Workspace  │     (Socket Mode)  │  Bot (Node)   │
└─────────────┘                    └──────┬───────┘
                                          │
                                    ┌─────▼─────┐
                                    │   APIs     │
                                    │ (jokes,    │
                                    │  quotes)   │
                                    └───────────┘
```

- **Socket Mode** — no public URL needed, connects via WebSocket
- **Caching** — API responses cached to reduce latency
- **Fallbacks** — every external API has a local fallback
- **Error handling** — global handlers prevent crashes

---

## 📝 Commit Like a Human (Recommended)

Commit early, commit often, and write messages like you're talking to a friend. Here's how real humans commit:

```bash
# Starting fresh
git add .
git commit -m "first working bot with /sp-ping command 🎉"

# Adding a feature
git commit -m "added /sp-joke command — tells random jokes 😂"

# Fixing something
git commit -m "fixed crash when API is down, now uses fallback quotes"

# Making things pretty
git commit -m "cleaned up response formatting, added emojis ✨"

# Multiple small changes at once
git commit -m "renamed commands, added /sp-help, updated README"
```

**Just push anytime something works:**
```bash
git push
```

No need for perfect messages. Just honest ones. Your future self (and anyone reading) will thank you.

## 📁 Project Structure

```
SlackSpace/
├── index.js             # Bot entry point (all commands)
├── package.json         # Dependencies & scripts
├── .env                 # Secrets (gitignored)
├── .env.example         # Template for .env
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── .agents/             # Context for future AI agents
    ├── CONTEXT.md       # Project overview for AI
    ├── ARCHITECTURE.md  # Architecture decisions
    └── COMMANDS.md      # Complete command reference
```

## 🧪 Commands Reference

| Command | Usage | Response Time |
|---|---|---|
| `/sp-ping` | `/sp-ping` | <1ms (local) |
| `/sp-help` | `/sp-help` | <1ms (local) |
| `/sp-joke` | `/sp-joke` | ~200ms (cached) |
| `/sp-fact` | `/sp-fact` | <1ms (local) |
| `/sp-inspire` | `/sp-inspire` | ~200ms (cached) |
| `/sp-8ball` | `/sp-8ball question?` | <1ms (local) |
| `/sp-echo` | `/sp-echo Hello` | <1ms (local) |
| `/sp-status` | `/sp-status` | <1ms (local) |

## 🤝 Contributing

Since this is a personal project by @lakkeychoudhary, contributions are tracked via the repository.

---

## 📝 License

MIT © [lakkeychoudhary](https://github.com/lakkeychoudhary)

---

## 🚀 Acknowledgements

- [Hack Club Stardance](https://stardance.hackclub.com) — for the awesome challenge
- [Slack Bolt JS](https://slack.dev/bolt-js) — the framework
- [Hack Club Nest](https://nest.hackclub.com) — free hosting