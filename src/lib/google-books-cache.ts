// Google Books API Cache System
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface SearchCacheEntry extends CacheEntry<any[]> {
  query: string;
  filters: any;
}

interface BookCacheEntry extends CacheEntry<any> {
  bookId: string;
}

class GoogleBooksCache {
  private static instance: GoogleBooksCache;
  private searchCache = new Map<string, SearchCacheEntry>();
  private bookCache = new Map<string, BookCacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100; // Maximum cache entries

  private constructor() {}

  public static getInstance(): GoogleBooksCache {
    if (!GoogleBooksCache.instance) {
      GoogleBooksCache.instance = new GoogleBooksCache();
    }
    return GoogleBooksCache.instance;
  }

  // Generate cache key for search queries
  private generateSearchKey(query: string, filters: any): string {
    return `search_${query}_${JSON.stringify(filters)}`;
  }

  // Generate cache key for individual books
  private generateBookKey(bookId: string): string {
    return `book_${bookId}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiry;
  }

  // Clean expired entries
  private cleanExpired() {
    const now = Date.now();
    
    // Clean search cache
    for (const [key, entry] of this.searchCache.entries()) {
      if (now >= entry.expiry) {
        this.searchCache.delete(key);
      }
    }
    
    // Clean book cache
    for (const [key, entry] of this.bookCache.entries()) {
      if (now >= entry.expiry) {
        this.bookCache.delete(key);
      }
    }
  }

  // Manage cache size
  private manageCacheSize() {
    // Remove oldest entries if cache is too large
    if (this.searchCache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.searchCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, sortedEntries.length - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.searchCache.delete(key));
    }

    if (this.bookCache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.bookCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, sortedEntries.length - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.bookCache.delete(key));
    }
  }

  // Get cached search results
  public getCachedSearch(query: string, filters: any): any[] | null {
    this.cleanExpired();
    const key = this.generateSearchKey(query, filters);
    const entry = this.searchCache.get(key);
    
    if (entry && this.isValid(entry)) {
      console.log('📚 Cache HIT: Search results retrieved from cache');
      return entry.data;
    }
    
    console.log('📚 Cache MISS: Search not found in cache');
    return null;
  }

  // Cache search results
  public setCachedSearch(query: string, filters: any, data: any[]): void {
    const key = this.generateSearchKey(query, filters);
    const now = Date.now();
    
    this.searchCache.set(key, {
      data,
      query,
      filters,
      timestamp: now,
      expiry: now + this.CACHE_DURATION
    });
    
    this.manageCacheSize();
    console.log('📚 Cache SET: Search results cached for 24 hours');
  }

  // Get cached book details
  public getCachedBook(bookId: string): any | null {
    this.cleanExpired();
    const key = this.generateBookKey(bookId);
    const entry = this.bookCache.get(key);
    
    if (entry && this.isValid(entry)) {
      console.log('📚 Cache HIT: Book details retrieved from cache');
      return entry.data;
    }
    
    console.log('📚 Cache MISS: Book not found in cache');
    return null;
  }

  // Cache book details
  public setCachedBook(bookId: string, data: any): void {
    const key = this.generateBookKey(bookId);
    const now = Date.now();
    
    this.bookCache.set(key, {
      data,
      bookId,
      timestamp: now,
      expiry: now + this.CACHE_DURATION
    });
    
    this.manageCacheSize();
    console.log('📚 Cache SET: Book details cached for 24 hours');
  }

  // Get cache statistics
  public getCacheStats() {
    const searchStats = {
      total: this.searchCache.size,
      valid: Array.from(this.searchCache.values()).filter(entry => this.isValid(entry)).length
    };
    
    const bookStats = {
      total: this.bookCache.size,
      valid: Array.from(this.bookCache.values()).filter(entry => this.isValid(entry)).length
    };
    
    return {
      search: searchStats,
      books: bookStats,
      totalMemoryUsage: this.searchCache.size + this.bookCache.size
    };
  }

  // Clear all cache
  public clearCache(): void {
    this.searchCache.clear();
    this.bookCache.clear();
    console.log('📚 Cache CLEARED: All cached data removed');
  }

  // Clear expired cache manually
  public clearExpired(): void {
    this.cleanExpired();
    console.log('📚 Cache CLEANED: Expired entries removed');
  }
}

export const googleBooksCache = GoogleBooksCache.getInstance();
