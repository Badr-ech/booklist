"use client";

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SpoilerTagProps {
  children: React.ReactNode;
  warning?: string;
  className?: string;
}

export function SpoilerTag({ 
  children, 
  warning = "Spoiler warning", 
  className 
}: SpoilerTagProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {!isRevealed ? (
        <div className="bg-gray-800 text-white p-3 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-yellow-400">⚠️ {warning}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRevealed(true)}
              className="text-xs bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Eye className="w-3 h-3 mr-1" />
              Show Spoiler
            </Button>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            Click to reveal potentially spoiling content
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-600 text-sm">Spoiler Content</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRevealed(false)}
              className="text-xs"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hide
            </Button>
          </div>
          <div className="text-gray-800 dark:text-gray-200">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to wrap spoiler content in reviews
export function wrapSpoilers(text: string): React.ReactNode[] {
  const spoilerRegex = /\[spoiler\](.*?)\[\/spoiler\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = spoilerRegex.exec(text)) !== null) {
    // Add text before spoiler
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add spoiler component
    parts.push(
      <SpoilerTag key={`spoiler-${keyIndex++}`}>
        {match[1]}
      </SpoilerTag>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}
