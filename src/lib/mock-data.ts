import type { Book } from './types';

export const mockBooks: Book[] = [
  // Currently Reading
  {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'reading',
    genre: 'Sci-Fi',
    description: 'The story of Paul Atreides, a young nobleman whose family accepts the stewardship of the desert planet Arrakis.',
  },
  {
    id: '2',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'reading',
    genre: 'Fantasy',
    description: 'A reluctant hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves to reclaim their mountain home, and treasure within it, from the dragon Smaug.',
  },
  // Read
  {
    id: '3',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'completed',
    genre: 'Sci-Fi',
    rating: 9,
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
  },
  {
    id: '4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'completed',
    genre: 'Classic',
    rating: 8,
  },
  {
    id: '5',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'completed',
    genre: 'Dystopian',
    rating: 9,
  },
  {
    id: '6',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'completed',
    genre: 'Romance',
    rating: 7,
  },
  // Plan to Read
  {
    id: '7',
    title: 'The Three-Body Problem',
    author: 'Cixin Liu',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'plan-to-read',
    genre: 'Sci-Fi',
  },
  {
    id: '8',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'plan-to-read',
    genre: 'Fantasy',
  },
  {
    id: '9',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'plan-to-read',
    genre: 'Non-Fiction',
  },
  {
    id: '10',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverImage: 'https://placehold.co/300x450.png',
    status: 'plan-to-read',
    genre: 'Contemporary Fiction',
  },
];

export const userProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatar: 'https://placehold.co/100x100.png',
  favoriteGenres: ['Sci-Fi', 'Fantasy', 'Classic', 'Dystopian', 'Non-Fiction'],
};

export const mockNewsFeed = [
    {
      id: '1',
      title: 'Annual Literary Gala Celebrates New Voices in Fiction',
      summary: 'The 25th Annual Literary Gala honored three debut novelists, highlighting a trend towards more diverse and experimental narratives in the publishing world.',
      link: '#',
    },
    {
      id: '2',
      title: 'Lost Manuscript of a Famous 20th-Century Author Discovered',
      summary: 'A previously unknown manuscript by the late, celebrated author has been found in an old university archive, promising a new addition to their influential body of work.',
      link: '#',
    },
    {
      id: '3',
      title: 'Book-to-Screen Adaptations Dominate Streaming Services This Fall',
      summary: 'A look at the upcoming wave of adaptations, from fantasy epics to historical dramas, and what it means for the relationship between literature and film.',
      link: '#',
    },
];

export const mockUpcomingReleases = [
    {
        id: 'ur1',
        title: 'The Stardust Weaver',
        author: 'Elara Vance',
        genre: 'Fantasy',
        releaseDate: 'October 15, 2024',
        coverImage: 'https://placehold.co/300x450.png'
    },
    {
        id: 'ur2',
        title: 'Echoes of Andromeda',
        author: 'Kaelen Rourke',
        genre: 'Sci-Fi',
        releaseDate: 'November 5, 2024',
        coverImage: 'https://placehold.co/300x450.png'
    },
    {
        id: 'ur3',
        title: 'The Crimson Cipher',
        author: 'Juliana Croft',
        genre: 'Thriller',
        releaseDate: 'December 3, 2024',
        coverImage: 'https://placehold.co/300x450.png'
    },
];
