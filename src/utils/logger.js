// ─── Structured Logger ─────────────────────────────────────────────
// Fast, lightweight logging with levels and colors
// Never logs tokens or secrets

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  purple: "\x1b[35m",
  gray: "\x1b[90m",
};

const LEVELS = {
  error: { color: COLORS.red, priority: 0, label: "ERROR" },
  warn: { color: COLORS.yellow, priority: 1, label: "WARN" },
  info: { color: COLORS.green, priority: 2, label: "INFO" },
  debug: { color: COLORS.blue, priority: 3, label: "DEBUG" },
  trace: { color: COLORS.gray, priority: 4, label: "TRACE" },
};

const LOG_LEVEL = (process.env.LOG_LEVEL || "info").toLowerCase();

class Logger {
  constructor(service = "slackspace") {
    this.service = service;
  }

  _format(level, message, extra = {}) {
    const timestamp = new Date().toISOString();
    const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset}`;
    const svc = `${COLORS.purple}[${this.service}]${COLORS.reset}`;
    const lvl = `${level.color}[${level.label}]${COLORS.reset}`;
    const msg = `${message}`;

    let output = `${prefix} ${svc} ${lvl} ${msg}`;

    if (Object.keys(extra).length > 0) {
      // Sanitize: never log anything that looks like a token
      const safe = this._sanitize(extra);
      output += ` ${COLORS.gray}${JSON.stringify(safe)}${COLORS.reset}`;
    }

    return output;
  }

  _sanitize(obj) {
    const safe = { ...obj };
    for (const key of Object.keys(safe)) {
      if (
        typeof safe[key] === "string" &&
        (safe[key].startsWith("xoxb-") || safe[key].startsWith("xapp-"))
      ) {
        safe[key] = "***REDACTED***";
      }
    }
    return safe;
  }

  _log(levelName, message, extra) {
    const level = LEVELS[levelName];
    if (level.priority <= LEVELS[LOG_LEVEL]?.priority || 2) {
      const output = this._format(level, message, extra);
      if (levelName === "error") {
        console.error(output);
      } else if (levelName === "warn") {
        console.warn(output);
      } else {
        console.log(output);
      }
    }
  }

  error(msg, extra) { this._log("error", msg, extra); }
  warn(msg, extra) { this._log("warn", msg, extra); }
  info(msg, extra) { this._log("info", msg, extra); }
  debug(msg, extra) { this._log("debug", msg, extra); }
  trace(msg, extra) { this._log("trace", msg, extra); }

  command(user, command, latency) {
    this.info(`/${command}`, { user, latency: `${latency}ms` });
  }

  api(service, success, latency) {
    if (success) {
      this.debug(`${service} ✓`, { latency: `${latency}ms` });
    } else {
      this.warn(`${service} ✗`, { latency: `${latency}ms` });
    }
  }
}

const logger = new Logger("slackspace");
module.exports = { Logger, logger };