// ─── Smart Cache Layer ────────────────────────────────────────────
// Ultra-fast in-memory cache with TTL, stats, and auto-cleanup

class SmartCache {
  constructor(options = {}) {
    this._store = new Map();
    this._defaultTTL = options.ttl || 60000; // 60s default
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;

    // Auto-cleanup every 5 minutes
    this._cleanupInterval = setInterval(() => this._cleanup(), 300000);
    this._cleanupInterval.unref();
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) {
      this._misses++;
      return null;
    }
    if (Date.now() > entry.expires) {
      this._store.delete(key);
      this._evictions++;
      this._misses++;
      return null;
    }
    this._hits++;
    return entry.value;
  }

  set(key, value, ttl) {
    const ttlMs = ttl || this._defaultTTL;
    this._store.set(key, {
      value,
      expires: Date.now() + ttlMs,
      created: Date.now(),
    });
    return value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this._store.delete(key);
  }

  clear() {
    this._store.clear();
  }

  // Called after failed fetch — stale data is better than no data
  getStale(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this._evictions++;
    }
    return entry.value; // Return even if stale
  }

  // Smart fetch: cache-first, with fallback on API failure
  async fetch(key, fetcher, ttl) {
    const cached = this.get(key);
    if (cached) return cached;

    try {
      const fresh = await fetcher();
      this.set(key, fresh, ttl);
      return fresh;
    } catch (err) {
      // API failed — try stale data
      const stale = this.getStale(key);
      if (stale) return stale;
      throw err; // Nothing in cache at all
    }
  }

  get stats() {
    const total = this._hits + this._misses;
    return {
      size: this._store.size,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      total,
      hitRate: total > 0 ? ((this._hits / total) * 100).toFixed(1) + "%" : "0%",
    };
  }

  _cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this._store) {
      if (now > entry.expires) {
        this._store.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this._evictions += cleaned;
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);
    this._store.clear();
  }
}

module.exports = { SmartCache };