"use client";

import { ReadingHistory } from '@/components/reading-history';

export default function ReadingHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ReadingHistory />
      </div>
    </div>
  );
}
