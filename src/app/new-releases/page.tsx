"use client";

import { NewReleases } from '@/components/new-releases';

export default function NewReleasesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <NewReleases />
      </div>
    </div>
  );
}
