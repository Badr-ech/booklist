// Google Books API Service with caching, fallback, and monitoring
import { googleBooksCache } from './google-books-cache';
import { MOCK_BOOKS, getMockBookById, getMockBooksForSearch } from './mock-books';
import type { BookSearchResult, Book } from './types';

// API monitoring and statistics
class APIMonitor {
  private static instance: APIMonitor;
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    mockDataUsed: 0,
    quotaExceeded: 0,
    lastRequestTime: null as Date | null,
    requestHistory: [] as Array<{
      timestamp: Date;
      type: 'search' | 'book';
      success: boolean;
      source: 'api' | 'cache' | 'mock';
      error?: string;
    }>
  };

  private constructor() {}

  public static getInstance(): APIMonitor {
    if (!APIMonitor.instance) {
      APIMonitor.instance = new APIMonitor();
    }
    return APIMonitor.instance;
  }

  public recordRequest(type: 'search' | 'book', success: boolean, source: 'api' | 'cache' | 'mock', error?: string) {
    this.stats.totalRequests++;
    this.stats.lastRequestTime = new Date();
    
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }
    
    switch (source) {
      case 'cache':
        this.stats.cacheHits++;
        break;
      case 'mock':
        this.stats.mockDataUsed++;
        break;
    }
    
    if (error?.includes('quota') || error?.includes('limit')) {
      this.stats.quotaExceeded++;
    }
    
    // Keep last 50 requests in history
    this.stats.requestHistory.push({
      timestamp: new Date(),
      type,
      success,
      source,
      error
    });
    
    if (this.stats.requestHistory.length > 50) {
      this.stats.requestHistory.shift();
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 API Monitor: ${type} request | ${success ? 'SUCCESS' : 'FAILED'} | Source: ${source.toUpperCase()}${error ? ` | Error: ${error}` : ''}`);
    }
  }

  public getStats() {
    const cacheStats = googleBooksCache.getCacheStats();
    return {
      ...this.stats,
      cacheStats,
      efficiency: {
        successRate: this.stats.totalRequests > 0 ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%',
        cacheHitRate: this.stats.totalRequests > 0 ? (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%',
        mockDataRate: this.stats.totalRequests > 0 ? (this.stats.mockDataUsed / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%'
      }
    };
  }

  public clearStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      mockDataUsed: 0,
      quotaExceeded: 0,
      lastRequestTime: null,
      requestHistory: []
    };
  }
}

export const apiMonitor = APIMonitor.getInstance();

// Main Google Books API service
class GoogleBooksService {
  private static instance: GoogleBooksService;
  private readonly API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
  private readonly USE_MOCK_DATA = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  private constructor() {}

  public static getInstance(): GoogleBooksService {
    if (!GoogleBooksService.instance) {
      GoogleBooksService.instance = new GoogleBooksService();
    }
    return GoogleBooksService.instance;
  }

  private getApiKey(): string | null {
    return process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || null;
  }

  // Enhanced error handling with specific error types
  private handleApiError(response: Response, data?: any): Error {
    if (response.status === 400 && data?.error?.message?.includes('API key not valid')) {
      return new Error('INVALID_API_KEY');
    }
    if (response.status === 403 && data?.error?.message?.includes('quota')) {
      return new Error('QUOTA_EXCEEDED');
    }
    if (response.status === 429) {
      return new Error('RATE_LIMITED');
    }
    return new Error(`HTTP_ERROR_${response.status}`);
  }

  // Search books with caching and fallback
  public async searchBooks(query: string, filters: any = {}): Promise<BookSearchResult[]> {
    // Force mock data if environment variable is set
    if (this.USE_MOCK_DATA) {
      console.log('🔧 Using mock data (development mode)');
      const mockResults = getMockBooksForSearch(query);
      apiMonitor.recordRequest('search', true, 'mock');
      return mockResults;
    }

    // Check cache first
    const cachedResults = googleBooksCache.getCachedSearch(query, filters);
    if (cachedResults) {
      apiMonitor.recordRequest('search', true, 'cache');
      return cachedResults;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('📚 No API key configured, using mock data');
      const mockResults = getMockBooksForSearch(query);
      apiMonitor.recordRequest('search', true, 'mock', 'No API key');
      return mockResults;
    }

    try {
      // Build query with filters
      let searchQuery = query;
      if (filters.genre && filters.genre !== 'All Genres') {
        searchQuery += `+subject:${filters.genre}`;
      }

      const url = `${this.API_BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=40&orderBy=${filters.sortBy === 'relevance' ? 'relevance' : 'newest'}&key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw this.handleApiError(response, errorData);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API_ERROR');
      }

      const results: BookSearchResult[] = data.items?.map((item: any) => {
        const publishedDate = item.volumeInfo.publishedDate;
        
        return {
          id: item.id,
          title: item.volumeInfo.title || 'Unknown Title',
          author: item.volumeInfo.authors?.[0] || 'Unknown Author',
          coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/300x450.png',
          description: item.volumeInfo.description,
          genre: item.volumeInfo.categories?.[0] || 'Uncategorized',
          status: 'plan-to-read' as const,
          publishedDate: publishedDate,
          averageRating: item.volumeInfo.averageRating || 0,
          ratingsCount: item.volumeInfo.ratingsCount || 0,
          pageCount: item.volumeInfo.pageCount,
          publisher: item.volumeInfo.publisher,
          language: item.volumeInfo.language || 'en'
        };
      }) || [];

      // Cache the results
      googleBooksCache.setCachedSearch(query, filters, results);
      apiMonitor.recordRequest('search', true, 'api');
      
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('📚 API search failed, using mock data:', errorMessage);
      
      // Fallback to mock data
      const mockResults = getMockBooksForSearch(query);
      apiMonitor.recordRequest('search', false, 'mock', errorMessage);
      
      return mockResults;
    }
  }

  // Get book details with caching and fallback
  public async getBookDetails(bookId: string): Promise<Book | null> {
    // Force mock data if environment variable is set
    if (this.USE_MOCK_DATA) {
      console.log('🔧 Using mock data (development mode)');
      const mockBook = getMockBookById(bookId);
      apiMonitor.recordRequest('book', true, 'mock');
      return {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        coverImage: mockBook.coverImage,
        description: mockBook.description,
        genre: mockBook.genre,
        status: 'plan-to-read'
      };
    }

    // Check cache first
    const cachedBook = googleBooksCache.getCachedBook(bookId);
    if (cachedBook) {
      apiMonitor.recordRequest('book', true, 'cache');
      return cachedBook;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('📚 No API key configured, using mock data');
      const mockBook = getMockBookById(bookId);
      apiMonitor.recordRequest('book', true, 'mock', 'No API key');
      return {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        coverImage: mockBook.coverImage,
        description: mockBook.description,
        genre: mockBook.genre,
        status: 'plan-to-read'
      };
    }

    try {
      const url = `${this.API_BASE_URL}/${bookId}?key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw this.handleApiError(response, errorData);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API_ERROR');
      }

      const bookData: Book = {
        id: data.id,
        title: data.volumeInfo.title || 'Unknown Title',
        author: data.volumeInfo.authors?.[0] || 'Unknown Author',
        coverImage: data.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/300x450.png',
        description: data.volumeInfo.description,
        genre: data.volumeInfo.categories?.[0] || 'Uncategorized',
        status: 'plan-to-read'
      };

      // Cache the book details
      googleBooksCache.setCachedBook(bookId, bookData);
      apiMonitor.recordRequest('book', true, 'api');
      
      return bookData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('📚 API book details failed, using mock data:', errorMessage);
      
      // Fallback to mock data
      const mockBook = getMockBookById(bookId);
      apiMonitor.recordRequest('book', false, 'mock', errorMessage);
      
      return {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        coverImage: mockBook.coverImage,
        description: mockBook.description,
        genre: mockBook.genre,
        status: 'plan-to-read'
      };
    }
  }

  // Get monitoring statistics
  public getMonitoringStats() {
    return apiMonitor.getStats();
  }

  // Clear cache and reset monitoring
  public clearCacheAndStats() {
    googleBooksCache.clearCache();
    apiMonitor.clearStats();
  }
}

export const googleBooksService = GoogleBooksService.getInstance();
