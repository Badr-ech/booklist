'use server';

import {
  generateBookRecommendations,
  type GenerateBookRecommendationsInput,
} from '@/ai/flows/generate-book-recommendations';
import { db } from '@/lib/firebase';
import { Book } from '@/lib/types';
import { doc, setDoc, serverTimestamp, collection, getDoc, Timestamp } from 'firebase/firestore';

export async function getBookRecommendations(input: GenerateBookRecommendationsInput) {
  try {
    const result = await generateBookRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting book recommendations:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function addBookToList({ userId, book }: { userId: string, book: Book }) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const bookRef = doc(db, 'users', userId, 'books', book.id);
    
    const bookData: any = {
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      status: book.status,
      genre: book.genre,
      description: book.description || null,
      dateAdded: serverTimestamp(),
    };
    
    if (typeof book.rating === 'number' && !isNaN(book.rating)) {
        bookData.rating = book.rating;
    }
    
    if (book.startDate) {
        bookData.startDate = book.startDate instanceof Date ? 
            Timestamp.fromDate(book.startDate) : 
            book.startDate;
    }
    
    if (book.endDate) {
        bookData.endDate = book.endDate instanceof Date ? 
            Timestamp.fromDate(book.endDate) : 
            book.endDate;
    }

    // Using { merge: true } is a safe way to update documents.
    // It creates the document if it doesn't exist, or merges the new data
    // with an existing document without overwriting the entire thing.
    await setDoc(bookRef, bookData, { merge: true });
    
    return { success: true };

  } catch (error: any) {
    console.error('[actions.ts] Firestore error adding book:', error);
    return {
      success: false,
      error: `An unexpected error occurred while adding the book. Details: ${error.message}`,
    };
  }
}

export async function addBookToWishlist({ userId, book }: { userId: string, book: Omit<Book, 'status'> }) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const wishlistRef = doc(collection(db, 'users', userId, 'wishlist'), book.id);
    await setDoc(wishlistRef, { 
        ...book, 
        status: 'plan-to-read',
        dateAdded: serverTimestamp() 
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding book to wishlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while adding to wishlist.',
    };
  }
}

export async function handleGoogleSignIn({ uid, email }: { uid: string; email: string | null }) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: uid,
        email: email,
        favoriteGenre: 'Fantasy',
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error handling Google sign-in:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during sign-in.',
    };
  }
}
