// Mock data for Google Books API fallback
import type { BookStatus } from './types';

export const MOCK_BOOKS = [
  {
    id: 'mock-book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://books.google.com/books/publisher/content/images/frontcover/iJwyDwAAQBAJ?fife=w300',
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on prosperous Long Island and in New York City.',
    genre: 'Fiction',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '1925-04-10',
    averageRating: 4.2,
    ratingsCount: 1000,
    pageCount: 180,
    publisher: 'Charles Scribner\'s Sons',
    language: 'en'
  },
  {
    id: 'mock-book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://books.google.com/books/publisher/content/images/frontcover/PGR2AwAAQBAJ?fife=w300',
    description: 'To Kill a Mockingbird is a novel by the American author Harper Lee. It was published in 1960 and was instantly successful.',
    genre: 'Fiction',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '1960-07-11',
    averageRating: 4.3,
    ratingsCount: 1500,
    pageCount: 376,
    publisher: 'J. B. Lippincott & Co.',
    language: 'en'
  },
  {
    id: 'mock-book-3',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://books.google.com/books/publisher/content/images/frontcover/kotPYEqx7kMC?fife=w300',
    description: '1984 is a dystopian social science fiction novel and cautionary tale written by English writer George Orwell.',
    genre: 'Fiction',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '1949-06-08',
    averageRating: 4.5,
    ratingsCount: 2000,
    pageCount: 328,
    publisher: 'Secker & Warburg',
    language: 'en'
  },
  {
    id: 'mock-book-4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://books.google.com/books/publisher/content/images/frontcover/s1gVAAAAQAAJ?fife=w300',
    description: 'Pride and Prejudice is an 1813 novel of manners written by Jane Austen.',
    genre: 'Romance',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '1813-01-28',
    averageRating: 4.4,
    ratingsCount: 1800,
    pageCount: 432,
    publisher: 'T. Egerton',
    language: 'en'
  },
  {
    id: 'mock-book-5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverImage: 'https://books.google.com/books/publisher/content/images/frontcover/PCDengEACAAJ?fife=w300',
    description: 'The Catcher in the Rye is a novel by J. D. Salinger.',
    genre: 'Fiction',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '1951-07-16',
    averageRating: 3.8,
    ratingsCount: 1200,
    pageCount: 277,
    publisher: 'Little, Brown and Company',
    language: 'en'
  }
];

export const getMockBookById = (id: string) => {
  return MOCK_BOOKS.find(book => book.id === id) || {
    id: id,
    title: 'Sample Book',
    author: 'Unknown Author',
    coverImage: 'https://placehold.co/300x450.png',
    description: 'This is a sample book. Please configure a valid Google Books API key for real book data.',
    genre: 'Fiction',
    status: 'plan-to-read' as BookStatus,
    publishedDate: '2024-01-01',
    averageRating: 4.0,
    ratingsCount: 100,
    pageCount: 200,
    publisher: 'Sample Publisher',
    language: 'en'
  };
};

export const getMockBooksForSearch = (query: string) => {
  if (!query) return [];
  
  return MOCK_BOOKS.filter(book => 
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase()) ||
    book.description.toLowerCase().includes(query.toLowerCase())
  );
};
