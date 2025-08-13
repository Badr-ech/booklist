'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Forum {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  tags: string[];
  lastActivity?: any;
}

interface ForumCardProps {
  forum: Forum;
}

export function ForumCard({ forum }: ForumCardProps) {
  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'fiction': '📚',
      'non-fiction': '📖',
      'fantasy': '🧙‍♂️',
      'mystery': '🔍',
      'romance': '💕',
      'sci-fi': '🚀',
      'biography': '👤',
      'general': '💬'
    };
    return emojiMap[category] || '📚';
  };

  return (
    <Link href={`/forums/${forum.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {getCategoryEmoji(forum.category)} {forum.category}
            </Badge>
            {forum.isActive && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Active
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2">{forum.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-3">{forum.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {forum.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {forum.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{forum.tags.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{forum.memberCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{forum.postCount}</span>
              </div>
            </div>
            {forum.lastActivity && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {formatDistanceToNow(forum.lastActivity.toDate(), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Created by {forum.createdByEmail}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
