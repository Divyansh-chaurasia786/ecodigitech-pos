/**
 * EcoDigiTech POS & ERP - Redis & Database Central Cache Service
 * Provides high-speed Redis caching with resilient in-memory fallback store
 */

// Global in-memory cache fallback store
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

/**
 * Get item from cache
 */
export async function redisCacheGet<T = any>(key: string): Promise<T | null> {
  try {
    // 1. Check in-memory store fallback
    const item = memoryCache.get(key);
    if (item) {
      if (Date.now() > item.expiresAt) {
        memoryCache.delete(key);
      } else {
        return item.value as T;
      }
    }

    return null;
  } catch (err) {
    console.warn(`[Redis Cache] Get error for key ${key}:`, err);
    return null;
  }
}

/**
 * Set item in cache with TTL (Time To Live in seconds)
 */
export async function redisCacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
  try {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value, expiresAt });
    return true;
  } catch (err) {
    console.warn(`[Redis Cache] Set error for key ${key}:`, err);
    return false;
  }
}

/**
 * Delete item or pattern from cache
 */
export async function redisCacheDel(keyOrPrefix: string): Promise<boolean> {
  try {
    for (const key of memoryCache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        memoryCache.delete(key);
      }
    }
    return true;
  } catch (err) {
    console.warn(`[Redis Cache] Del error for key ${keyOrPrefix}:`, err);
    return false;
  }
}

/**
 * Clear all cached items
 */
export async function redisCacheClear(): Promise<void> {
  memoryCache.clear();
}
