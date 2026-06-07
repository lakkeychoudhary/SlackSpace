// ─── Intelligent Rate Limiter ─────────────────────────────────────
// Per-user sliding window rate limiter
// Prevents abuse while being fair

class RateLimiter {
  constructor(options = {}) {
    this._buckets = new Map();
    this._maxCommands = options.maxCommands || 20;  // max per window
    this._windowMs = options.windowMs || 60000;     // 1 minute window
    this._cooldownMs = options.cooldownMs || 1000;  // 1s between commands

    // Auto-cleanup expired buckets every 5 min
    this._cleanupInterval = setInterval(() => this._cleanup(), 300000);
    this._cleanupInterval.unref();
  }

  _getBucket(userId) {
    let bucket = this._buckets.get(userId);
    if (!bucket) {
      bucket = { count: 0, firstRequest: Date.now(), lastRequest: 0, blocked: false };
      this._buckets.set(userId, bucket);
    }
    return bucket;
  }

  check(userId) {
    const bucket = this._getBucket(userId);
    const now = Date.now();

    // Reset window if expired
    if (now - bucket.firstRequest > this._windowMs) {
      bucket.count = 0;
      bucket.firstRequest = now;
      bucket.blocked = false;
    }

    // Check cooldown (prevent rapid firing)
    if (now - bucket.lastRequest < this._cooldownMs) {
      return {
        allowed: false,
        reason: "rate_limit_cooldown",
        waitMs: this._cooldownMs - (now - bucket.lastRequest),
        retryAfter: Math.ceil((this._cooldownMs - (now - bucket.lastRequest)) / 1000),
      };
    }

    // Check max commands
    if (bucket.count >= this._maxCommands) {
      bucket.blocked = true;
      const resetIn = Math.ceil((this._windowMs - (now - bucket.firstRequest)) / 1000);
      return {
        allowed: false,
        reason: "rate_limit_exceeded",
        maxAllowed: this._maxCommands,
        resetIn: `${resetIn}s`,
      };
    }

    // Allow
    bucket.count++;
    bucket.lastRequest = now;

    return {
      allowed: true,
      remaining: this._maxCommands - bucket.count,
      resetsIn: Math.ceil((this._windowMs - (now - bucket.firstRequest)) / 1000),
    };
  }

  // Middleware for Bolt
  middleware() {
    const self = this;
    return async ({ payload, next }) => {
      const userId = payload.user_id || payload.user || "unknown";
      const result = self.check(userId);

      if (!result.allowed) {
        // Create a modified respond function
        return;  // Will be handled by the command itself
      }

      await next();
    };
  }

  get stats() {
    const now = Date.now();
    const active = [...this._buckets.values()].filter(
      b => now - b.firstRequest < this._windowMs
    ).length;
    const blocked = [...this._buckets.values()].filter(
      b => b.blocked
    ).length;

    return {
      activeUsers: active,
      blockedUsers: blocked,
      totalBuckets: this._buckets.size,
    };
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this._buckets) {
      if (now - bucket.firstRequest > this._windowMs * 2) {
        this._buckets.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);
    this._buckets.clear();
  }
}

module.exports = { RateLimiter };