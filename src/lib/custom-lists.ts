import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { CustomList, CustomListBook, Book } from './types';

/**
 * Create a new custom list
 */
export async function createCustomList(
  userId: string, 
  name: string, 
  description?: string, 
  isPublic: boolean = false
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const listData: Omit<CustomList, 'id'> = {
      userId,
      name: name.trim(),
      description: description?.trim(),
      isPublic,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      bookCount: 0,
    };

    const docRef = await addDoc(collection(db, 'customLists'), listData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating custom list:', error);
    return { success: false, error: 'Failed to create list' };
  }
}

/**
 * Get all custom lists for a user
 */
export async function getUserCustomLists(userId: string): Promise<CustomList[]> {
  try {
    const q = query(
      collection(db, 'customLists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const lists: CustomList[] = [];
    
    snapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() } as CustomList);
    });
    
    return lists;
  } catch (error) {
    console.error('Error fetching custom lists:', error);
    return [];
  }
}

/**
 * Update a custom list
 */
export async function updateCustomList(
  listId: string,
  updates: Partial<Pick<CustomList, 'name' | 'description' | 'isPublic'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const listRef = doc(db, 'customLists', listId);
    
    await updateDoc(listRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating custom list:', error);
    return { success: false, error: 'Failed to update list' };
  }
}

/**
 * Delete a custom list and all its books
 */
export async function deleteCustomList(listId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First delete all books in the list
    const booksQuery = query(
      collection(db, 'customListBooks'),
      where('listId', '==', listId)
    );
    
    const booksSnapshot = await getDocs(booksQuery);
    const deletePromises = booksSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Then delete the list itself
    await deleteDoc(doc(db, 'customLists', listId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting custom list:', error);
    return { success: false, error: 'Failed to delete list' };
  }
}

/**
 * Add a book to a custom list
 */
export async function addBookToCustomList(
  listId: string,
  book: Pick<Book, 'id' | 'title' | 'author' | 'coverImage' | 'genre'>,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if book is already in the list
    const existingQuery = query(
      collection(db, 'customListBooks'),
      where('listId', '==', listId),
      where('bookId', '==', book.id)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      return { success: false, error: 'Book is already in this list' };
    }
    
    const listBookData: Omit<CustomListBook, 'id'> = {
      listId,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage,
      bookGenre: book.genre,
      addedAt: serverTimestamp() as Timestamp,
      note: note?.trim(),
    };
    
    await addDoc(collection(db, 'customListBooks'), listBookData);
    
    // Update book count in the list
    const listRef = doc(db, 'customLists', listId);
    const listDoc = await getDoc(listRef);
    
    if (listDoc.exists()) {
      const currentCount = listDoc.data().bookCount || 0;
      await updateDoc(listRef, {
        bookCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding book to custom list:', error);
    return { success: false, error: 'Failed to add book to list' };
  }
}

/**
 * Remove a book from a custom list
 */
export async function removeBookFromCustomList(
  listId: string,
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const q = query(
      collection(db, 'customListBooks'),
      where('listId', '==', listId),
      where('bookId', '==', bookId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: false, error: 'Book not found in list' };
    }
    
    // Delete the book from the list
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Update book count in the list
    const listRef = doc(db, 'customLists', listId);
    const listDoc = await getDoc(listRef);
    
    if (listDoc.exists()) {
      const currentCount = listDoc.data().bookCount || 0;
      await updateDoc(listRef, {
        bookCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing book from custom list:', error);
    return { success: false, error: 'Failed to remove book from list' };
  }
}

/**
 * Get all books in a custom list
 */
export async function getCustomListBooks(listId: string): Promise<CustomListBook[]> {
  try {
    const q = query(
      collection(db, 'customListBooks'),
      where('listId', '==', listId),
      orderBy('addedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const books: CustomListBook[] = [];
    
    snapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() } as CustomListBook);
    });
    
    return books;
  } catch (error) {
    console.error('Error fetching custom list books:', error);
    return [];
  }
}

/**
 * Get a single custom list by ID
 */
export async function getCustomList(listId: string): Promise<CustomList | null> {
  try {
    const listDoc = await getDoc(doc(db, 'customLists', listId));
    
    if (listDoc.exists()) {
      return { id: listDoc.id, ...listDoc.data() } as CustomList;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching custom list:', error);
    return null;
  }
}

/**
 * Check if a book is in any of user's custom lists
 */
export async function getBookCustomLists(userId: string, bookId: string): Promise<CustomList[]> {
  try {
    // First get all user's lists
    const userLists = await getUserCustomLists(userId);
    
    // Then check which ones contain this book
    const listsWithBook: CustomList[] = [];
    
    for (const list of userLists) {
      const bookQuery = query(
        collection(db, 'customListBooks'),
        where('listId', '==', list.id),
        where('bookId', '==', bookId)
      );
      
      const bookSnapshot = await getDocs(bookQuery);
      if (!bookSnapshot.empty) {
        listsWithBook.push(list);
      }
    }
    
    return listsWithBook;
  } catch (error) {
    console.error('Error checking book custom lists:', error);
    return [];
  }
}
