/**
 * 簡單的記憶體快取中介軟體
 * 用於快取API響應以提高性能
 * 
 * 注意: 這是一個基礎快取實現
 * 對於生產環境，建議使用Redis
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * 設置快取
   * @param {string} key - 快取鍵
   * @param {*} value - 快取值
   * @param {number} ttl - 生存時間（秒）
   */
  set(key, value, ttl = 300) {
    // 清除舊的計時器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // 設置快取
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl: ttl * 1000
    });

    // 設置過期時間
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * 獲取快取
   * @param {string} key - 快取鍵
   * @returns {*} 快取值或null
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.createdAt;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * 檢查快取是否存在
   * @param {string} key - 快取鍵
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 刪除快取
   * @param {string} key - 快取鍵
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * 清空所有快取
   */
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * 獲取快取統計信息
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 全局快取實例
const cache = new SimpleCache();

/**
 * 快取中介軟體工廠
 * 使用方法: app.get('/api/products', cacheMiddleware(300), handler)
 * 
 * @param {number} ttl - 生存時間（秒）
 * @returns {function} Express中介軟體
 */
function cacheMiddleware(ttl = 300) {
  return (req, res, next) => {
    // 只快取GET請求
    if (req.method !== 'GET') {
      return next();
    }

    // 生成快取鍵
    const key = `${req.method}:${req.originalUrl}`;

    // 檢查快取
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // 攔截res.json方法以快取響應
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // 只快取成功的響應
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
        res.set('X-Cache', 'MISS');
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * 實用函數：清除特定模式的快取
 * 用於數據更新時清除相關快取
 * 
 * @param {string} pattern - 快取鍵模式（支持*通配符）
 */
function invalidateCache(pattern) {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  const keys = cache.stats().keys;
  
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  SimpleCache
};
