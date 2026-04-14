/**
 * LRU Cache for error analysis results
 * Prevents redundant regex matching and analysis
 */
export class ErrorCache {
  private cache: Map<string, any>;
  private maxSize: number;
  private order: string[] = [];

  constructor(maxSize: number = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): any {
    if (!this.cache.has(key)) return undefined;
    
    // Move to end (most recently used)
    this.order = this.order.filter(k => k !== key);
    this.order.push(key);
    
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    // If key exists, remove it
    if (this.cache.has(key)) {
      this.order = this.order.filter(k => k !== key);
    }
    
    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lru = this.order.shift();
      if (lru) this.cache.delete(lru);
    }
    
    this.cache.set(key, value);
    this.order.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.order = [];
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Compile and cache regex patterns for performance
 */
export class RegexCache {
  private cache: Map<string, RegExp> = new Map();

  compile(pattern: string, flags: string = ""): RegExp {
    const key = `${pattern}|${flags}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const regex = new RegExp(pattern, flags);
    this.cache.set(key, regex);
    return regex;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
