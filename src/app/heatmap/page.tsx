"use client";

import { ReadingHeatmap } from '@/components/reading-heatmap';

export default function HeatmapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ReadingHeatmap />
      </div>
    </div>
  );
}
