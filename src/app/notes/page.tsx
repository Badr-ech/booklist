"use client";

import { BookNotesManager } from '@/components/book-notes-manager';

export default function BookNotesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <BookNotesManager />
      </div>
    </div>
  );
}
