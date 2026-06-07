# 🤝 Contributing to SlackSpace

Thanks for your interest in contributing! Here's everything you need to know.

## 🚀 Quick Start

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/SlackSpace.git
cd SlackSpace
npm install
cp .env.example .env    # Add your tokens
npm start               # Run locally
```

## 📝 Commit Like a Human

We keep commits simple, honest, and easy to read — just like humans do.

### ✅ Good Examples

```bash
# Starting fresh
git commit -m "first working bot with /sp-ping command 🎉"

# Adding a feature
git commit -m "added /sp-joke command — tells random jokes 😂"

# Fixing something
git commit -m "fixed crash when API is down, now uses fallback quotes"

# Making things pretty
git commit -m "cleaned up response formatting, added emojis ✨"

# Multiple small changes
git commit -m "renamed commands, added /sp-help, updated README"
```

### ❌ Bad Examples

```bash
# Too vague
git commit -m "update"

# Too technical and impersonal
git commit -m "feat: refactor command handler architecture v2"

# Not helpful
git commit -m "asdfgh"
```

### The Rules

1. **Write like you're talking to a friend** — not a robot
2. **Describe what changed** — "added", "fixed", "updated", "removed"
3. **Include an emoji** — it makes the log visual and fun 🎉
4. **Be honest** — if you don't know, say "attempted" or "wip"
5. **Push often** — small commits are better than one massive one

## 🐛 Bug Reports

Found something broken? Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce

## 💡 Feature Ideas

Have an idea? Open an issue with:
- What the feature would do
- Why it would be useful
- How you think it should work

## 📁 Project Structure

```
SlackSpace/
├── index.js                 # Entry point
├── src/
│   ├── commands/            # One file per command
│   ├── utils/               # Cache, logger
│   └── middleware/          # Rate limiter
├── docs/                    # GitHub Pages site
└── .agents/                 # AI context files
```

### Adding a New Command

1. Create `src/commands/yourcommand.js`
2. Add it to `src/commands/commands.js` registry
3. That's it! The dynamic loader picks it up automatically

```javascript
// src/commands/yourcommand.js
module.exports = function (app, { BOT_PREFIX, BOT_NAME }) {
  app.command(`/${BOT_PREFIX}-yourcommand`, async ({ command, ack, respond }) => {
    await ack();
    await respond({ text: "Your response here!" });
  });
};
```

## 🔒 Security

- **Never** commit `.env` files
- **Never** commit API keys or tokens
- If you find a security issue, email the maintainer directly

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Made with 💜 by [@lakkeychoudhary](https://github.com/lakkeychoudhary)