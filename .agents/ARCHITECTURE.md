# 🏗️ SlackSpace Bot — Architecture Decisions

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Slack Workspace                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │  User types /sp-ping in #general                   │  │
│  └──────────────┬─────────────────────────────────────┘  │
│                 │                                         │
│                 ▼                                         │
│  ┌──────────────────────────────┐                        │
│  │  Slack Events API            │                        │
│  │  (Socket Mode WebSocket)     │                        │
│  └──────────────┬──────────────┘                        │
└─────────────────┼─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                   SlackSpace Bot (Node.js)               │
│                                                         │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  Bolt App     │    │  In-Memory Cache             │   │
│  │  (socketMode) │───►│  - jokes: 30s TTL            │   │
│  └──────┬───────┘    │  - quotes: 60s TTL            │   │
│         │            └──────────────────────────────┘   │
│         ▼                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Command Router                        │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │   │
│  │  │ping  │ │help  │ │joke  │ │fact  │ │inspire│   │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                      │   │
│  │  │8ball │ │echo  │ │status│                      │   │
│  │  └──────┘ └──────┘ └──────┘                      │   │
│  └──────────────────────────────────────────────────┘   │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
┌────────────────────┐    ┌────────────────────┐
│  Official Joke API  │    │  ZenQuotes API      │
│  (random_joke)      │    │  (random quote)     │
└────────────────────┘    └────────────────────┘
```

## File Structure

```
SlackSpace/
├── index.js          ← SINGLE file for all bot logic
│                      (All 8 commands, cache, error handlers,
│                       startup sequence)
│
├── package.json      ← npm config, scripts, dependencies
├── .env              ← SECRET: Slack tokens (gitignored)
├── .env.example      ← Template explaining how to get tokens
├── .gitignore        ← Prevents .env, node_modules from being committed
├── README.md         ← Full documentation & setup guide
│
└── .agents/          ← Context files for future AI agents
    ├── CONTEXT.md     ← Project overview
    ├── ARCHITECTURE.md← This file
    └── COMMANDS.md    ← Command reference
```

## Why This Architecture?

### 1. Single-File vs Modular
**Decision:** Single `index.js` file for all commands.
**Why:** This is a focused bot with 8 small commands. A single file is:
- Easier to understand at a glance
- Simpler to deploy (one file to check)
- No complex imports/requires between modules
- Can be split into modules if it grows beyond ~20 commands

### 2. Socket Mode vs HTTP Endpoints
**Decision:** Socket Mode.
**Why:**
- No need for a public URL or reverse proxy
- No ngrok required for local testing
- Simpler deployment on Nest (no port forwarding)
- Slack pushes events directly over WebSocket

### 3. In-Memory Cache vs Database
**Decision:** Simple in-memory Map with TTL.
**Why:**
- No database setup needed
- Sub-millisecond lookup
- Sufficient for a single-instance bot
- Cache automatically expires stale entries
- Can be replaced with Redis if scaling horizontally

### 4. Local Data vs API for Everything
**Decision:** Hybrid — local data for most commands, APIs for enrichment.
**Why:**
- 5/8 commands need NO external API (ping, help, fact, 8ball, echo, status)
- Only 2 commands use APIs (joke, inspire)
- Each API command has a local fallback
- Result: most commands respond in <1ms

### 5. Error Handling Strategy
**Three layers:**
1. **Per-command try/catch** — Each command handles its own errors
2. **API fallbacks** — If an API fails, use local data instead
3. **Global handlers** — `unhandledRejection` + `uncaughtException` prevent crashes
4. **Slack ack() timeout** — Bot acknowledges within 3 seconds as required by Slack

### 6. Performance Optimizations
- **Cache API responses** — Jokes cached 30s, quotes cached 60s
- **Minimal logging** — `LogLevel.ERROR` reduces overhead
- **No unnecessary dependencies** — Only 3 packages: bolt, dotenv, axios
- **Local response data** — Space facts, 8-ball answers stored in arrays

## Deployment Architecture

### Local Development
```
Your Machine ──WebSocket──► Slack
  node index.js
```

### Nest Production (24/7)
```
Nest Server ──WebSocket──► Slack
  │
  systemd (slackspace.service)
  ├── Restart=always
  ├── WorkingDirectory=/root/SlackSpace
  └── ExecStart=/usr/bin/node index.js
```

### Monitoring
- Logs: `journalctl --user -u slackspace.service -f`
- Health: `/sp-status` command
- Uptime tracking in `/sp-status` response

## Security
- **Never commit `.env`** — `.gitignore` prevents it
- **Treat tokens like passwords** — Both xoxb- and xapp- tokens are sensitive
- **No hardcoded secrets** — All config via environment variables
- **API keys** — If adding new APIs, always use `.env`

## Future Scalability
If the bot outgrows single-file architecture:
- Split commands into `commands/` directory
- Use a proper caching layer (Redis)
- Add a database (PostgreSQL for complex state)
- Use Slack's Events API for message-based interactions
- Add rate limiting per user
