# 🛸 SlackSpace — Complete Command Reference for AI Agents

## Command Registration

All commands must be registered in the Slack API dashboard at https://api.slack.com/apps → Your App → Slash Commands.

**Prefix:** All commands use `/sp-` (SP = SlackSpace) to guarantee uniqueness in the Hack Club workspace.

---

## Command 1: `/sp-ping` — Latency Check

**File Location:** `index.js`, around line 50

**Behavior:**
- Records start time before `ack()`
- Measures time until after `ack()` completes
- Responds with latency in milliseconds
- Includes UTC timestamp, channel, and user mention

**Response Format:**
```
⚡ PONG! 🏓

Latency: 2ms 🚀
Server Time: 2026-06-07 14:30:00 UTC
Channel: #general
User: @user

🤖 SlackSpace v1.0.0 · Response time: 2ms
```

**Slack Dashboard Config:**
- Command: `/sp-ping`
- Description: `Check bot latency`
- Usage Hint: `/sp-ping`

**Dependencies:** None (local)

---

## Command 2: `/sp-help` — List Commands

**File Location:** `index.js`, around line 80

**Behavior:**
- Lists all 8 available commands with descriptions and emojis
- Shows tip about `/sp-echo`
- Includes GitHub link in footer

**Response Format:**
```
🚀 SlackSpace — Available Commands
Hi @user! Here's what I can do:

• /sp-ping 🏓 — Check bot latency
• /sp-help ❓ — Show this help message
• /sp-joke 😂 — Get a random joke
• /sp-fact 🌌 — Learn a space fact
• /sp-inspire 💫 — Get inspired
• /sp-8ball 🔮 — Ask the 8-ball
• /sp-echo 📢 — Make me say something
• /sp-status 📊 — Check bot health

💡 Tip: Use /sp-echo <message> to make me repeat anything!

─────────────────
🤖 SlackSpace v1.0.0 · Built with ❤️ by @lakkeychoudhary
🏠 GitHub
```

**Slack Dashboard Config:**
- Command: `/sp-help`
- Description: `List all available commands`
- Usage Hint: `/sp-help`

**Dependencies:** None (local)

---

## Command 3: `/sp-joke` — Random Joke

**File Location:** `index.js`, around line 130

**Behavior:**
- Fetches from `https://official-joke-api.appspot.com/random_joke`
- Caches result for 30 seconds (TTL) — reduces API calls
- Punchline is hidden behind a spoiler tag (`||punchline||`)
- Falls back to a default joke if API fails

**API Response Shape:**
```json
{
  "setup": "Why did the chicken cross the road?",
  "punchline": "To get to the other side!"
}
```

**Response Format:**
```
😂 Random Joke

Why did the chicken cross the road?

||To get to the other side!||

Requested by @user · 🤖 SlackSpace
```

**Slack Dashboard Config:**
- Command: `/sp-joke`
- Description: `Get a random joke to laugh at`
- Usage Hint: `/sp-joke`

**Dependencies:** `axios`, Official Joke API

---

## Command 4: `/sp-fact` — Space Fact

**File Location:** `index.js`, around line 170

**Behavior:**
- Selects randomly from 15 hardcoded space facts
- Instant response — no API calls needed
- Includes context line noting the fact is locally stored

**Available Facts (15 total):**
1. Saturn's density is so low that it would float in water!
2. The Sun makes up 99.86% of all mass in our solar system.
3. A day on Venus is longer than a year on Venus.
4. The Moon is slowly drifting away from Earth at 3.8 cm per year.
5. There are more stars in the universe than grains of sand on Earth.
6. A single lightning bolt on Jupiter is 1,000x more powerful than Earth's.
7. Neutron stars can spin 600 times per second!
8. The largest known star, UY Scuti, could fit 5 billion Suns inside it.
9. Space is completely silent — there's no air for sound to travel through.
10. A day on Mars is only 40 minutes longer than a day on Earth.
11. The International Space Station travels at 17,500 mph (28,000 km/h).
12. Over 1 million Earths could fit inside the Sun!
13. One teaspoon of neutron star material would weigh 10 million tons.
14. The Andromeda Galaxy is on a collision course with the Milky Way — in 4.5 billion years!
15. There's a massive cloud of water in space containing 140 trillion times Earth's oceans.

**Slack Dashboard Config:**
- Command: `/sp-fact`
- Description: `Learn an amazing space fact`
- Usage Hint: `/sp-fact`

**Dependencies:** None (local data)

---

## Command 5: `/sp-inspire` — Inspirational Quote

**File Location:** `index.js`, around line 215

**Behavior:**
- Fetches from `https://zenquotes.io/api/random`
- Caches result for 60 seconds (TTL)
- Parses response where `data[0].q` = quote text, `data[0].a` = author
- **5 fallback quotes** from Steve Jobs, Cory House, John Johnson, Martin Fowler, Chinese Proverb
- If API fails, uses fallback and labels response as "Offline mode"

**API Response Shape:**
```json
[{"q": "The only way to do great work...", "a": "Steve Jobs"}]
```

**Fallback Quotes:**
1. "The only way to do great work is to love what you do." — Steve Jobs
2. "Code is like humor. When you have to explain it, it's bad." — Cory House
3. "First, solve the problem. Then, write the code." — John Johnson
4. "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler
5. "The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb

**Response Format:**
```
💫 Inspiration

> "The only way to do great work is to love what you do."
> — Steve Jobs

✨ Stay inspired, @user! · 🤖 SlackSpace
```

**Slack Dashboard Config:**
- Command: `/sp-inspire`
- Description: `Get an inspirational quote`
- Usage Hint: `/sp-inspire`

**Dependencies:** `axios`, ZenQuotes API

---

## Command 6: `/sp-8ball` — Magic 8-Ball

**File Location:** `index.js`, around line 280

**Behavior:**
- Requires a question as text argument (e.g., `/sp-8ball Will I pass?`)
- If no question provided, returns usage error
- Selects randomly from 19 possible answers
- Instant response — no API calls

**Available Answers (19 total):**
| Type | Answers |
|------|---------|
| ✅ Affirmative | Yes definitely!, It is certain., Without a doubt., Yes absolutely!, You may rely on it., As I see it, yes., Most likely., Outlook good., Signs point to yes. |
| 🤔 Non-committal | Reply hazy, try again., Ask again later., Better not tell you now., Cannot predict now., Concentrate and ask again. |
| ❌ Negative | Don't count on it., My reply is no., My sources say no., Outlook not so good., Very doubtful. |

**Slack Dashboard Config:**
- Command: `/sp-8ball`
- Description: `Ask the magic 8-ball a question`
- Usage Hint: `/sp-8ball Will I finish this project?`

**Dependencies:** None (local data)

---

## Command 7: `/sp-echo` — Echo Utility

**File Location:** `index.js`, around line 340

**Behavior:**
- Repeats the user's message back to them
- If no message provided, returns usage hint
- Wraps message in blockquote format

**Response Format:**
```
📢 SlackSpace says:

> Hello world!

🗣️ Echoed by @user
```

**Slack Dashboard Config:**
- Command: `/sp-echo`
- Description: `Make the bot say something`
- Usage Hint: `/sp-echo Hello world!`

**Dependencies:** None (local)

---

## Command 8: `/sp-status` — Bot Health

**File Location:** `index.js`, around line 370

**Behavior:**
- Reports system health metrics:
  - Status: Online/Offline
  - Uptime: Formatted (e.g., `2d 5h 30m 15s`)
  - Memory: Heap used in MB
  - Node.js version
  - Platform (e.g., `linux`, `win32`)
  - Command count: 8 active

**Response Format:**
```
📊 SlackSpace — System Status

✅ Status: Online & Operational

⏱ Uptime: 2d 5h 30m 15s
🧠 Memory: 34.2 MB
🔢 Node.js: v20.11.0
💻 Platform: linux
📦 Commands: 8 active

🤖 SlackSpace v1.0.0 · Built for Hack Club Stardance 🚀
```

**Slack Dashboard Config:**
- Command: `/sp-status`
- Description: `Check bot health & uptime`
- Usage Hint: `/sp-status`

**Dependencies:** None (local/process)

---

## Adding a New Command — Developer Guide

To add a new command to the bot, follow this pattern:

```javascript
// ════════════════════════════════════════════════════════════════
//  🛸 COMMAND N: /sp-<name> — <description>
// ════════════════════════════════════════════════════════════════
app.command(`/${BOT_PREFIX}-<name>`, async ({ command, ack, respond }) => {
  await ack(); // REQUIRED — must run within 3 seconds!

  try {
    // Your logic here
    await respond({
      text: "Your response text",
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Your formatted response" }
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: "Context footer" }]
        }
      ]
    });
  } catch (err) {
    await respond({ text: "Fallback response if error" });
  }
});
```

Then register the command at: Slack API Dashboard → Slash Commands → Create New Command

## Command Response Patterns

All commands use Slack's Block Kit for rich responses:
1. **`section` block** — Main content with mrkdwn formatting
2. **`context` block** — Footer with metadata (requester, bot version, timestamp)
3. **`header` block** — Title (used in `/sp-help` and `/sp-status`)
4. **`divider` block** — Visual separator

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Commands needing API | 2 of 8 (joke, inspire) |
| Avg response (local) | <1ms |
| Avg response (cached) | ~200ms |
| Avg response (API miss) | ~500-1000ms |
| Cache TTL (jokes) | 30s |
| Cache TTL (quotes) | 60s |
| Memory per instance | ~35MB |