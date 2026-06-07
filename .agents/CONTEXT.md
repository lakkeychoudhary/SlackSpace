# 🚀 SlackSpace Bot — Full Context for AI Agents

## Project Identity
- **Name:** SlackSpace Bot
- **Owner/Maintainer:** @lakkeychoudhary (GitHub: lakkeychoudhary, Email: choudharylakkey@gmail.com)
- **GitHub:** https://github.com/lakkeychoudhary/SlackSpace
- **Purpose:** A fast, space-themed Slack slash-command bot for the Hack Club workspace
- **Mission:** Built for Hack Club Stardance (https://stardance.hackclub.com/missions/slack-bot/guide)
- **App Name:** SlackSpace

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Slack Bolt (@slack/bolt) v4.x
- **HTTP Client:** Axios
- **Connection Mode:** Socket Mode (WebSocket, no public URL needed)
- **Env Management:** dotenv (.env file)
- **Hosting:** Hack Club Nest (Debian server, systemd service)
- **Package Manager:** npm

## Key Design Decisions
1. **Socket Mode** — Avoids needing a public URL/ngrok. Bot connects to Slack via WebSocket.
2. **`/sp-` prefix** — SP = SlackSpace. All commands prefixed to avoid collision with other bots.
3. **Caching** — In-memory Map-based cache for API responses (jokes, quotes) with TTL.
4. **Fallbacks** — Every external API command has a local fallback if the API is down.
5. **Error Resilience** — Global `unhandledRejection` and `uncaughtException` handlers prevent crashes.
6. **Local-first** — Commands like `/sp-fact`, `/sp-8ball`, `/sp-ping`, `/sp-status` need NO external API.

## Commands (8 total)
| # | Command | Type | Source | Response Time |
|---|---------|------|--------|---------------|
| 1 | `/sp-ping` | Utility | Local | <1ms |
| 2 | `/sp-help` | Help | Local | <1ms |
| 3 | `/sp-joke` | Fun | API (official-joke-api) | ~200ms cached |
| 4 | `/sp-fact` | Education | Local (15 space facts) | <1ms |
| 5 | `/sp-inspire` | Motivation | API (zenquotes.io) + fallback | ~200ms cached |
| 6 | `/sp-8ball` | Fun | Local (19 responses) | <1ms |
| 7 | `/sp-echo` | Utility | Local | <1ms |
| 8 | `/sp-status` | Info | Local (process stats) | <1ms |

## Submission Requirements (Stardance)
1. ✅ Bot is live and responds to messages
2. ✅ At least 3 different commands — we have 8
3. ✅ Commands don't collide — `/sp-` prefix ensures uniqueness
4. ✅ Bot runs 24/7 via Nest systemd service

## Token Requirements (CRITICAL)
Two tokens needed in `.env`:
- `SLACK_BOT_TOKEN` (starts with `xoxb-`) — Bot User OAuth Token
- `SLACK_APP_TOKEN` (starts with `xapp-`) — App-Level Token with `connections:write` scope

## Slack App Setup Required
Must register 8 slash commands in Slack API dashboard:
- `/sp-ping`, `/sp-help`, `/sp-joke`, `/sp-fact`, `/sp-inspire`, `/sp-8ball`, `/sp-echo`, `/sp-status`

## Deployment
- Local: `node index.js`
- Nest: systemd service (`slackspace.service`)
- Service file: `/etc/systemd/system/slackspace.service`
- Working dir on Nest: `/root/SlackSpace`
- Auto-restart: `Restart=always` in systemd config

## Architecture
```
Slack ──WebSocket──► SlackSpace Bot (Node.js) ──HTTP──► External APIs
                         │
                         ▼
                   In-Memory Cache
                   (Map with TTL)
```

## Git Configuration
- Global user: lakkeychoudhary
- Global email: choudharylakkey@gmail.com
- This project only: Same as global