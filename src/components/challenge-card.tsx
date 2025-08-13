'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Calendar, Target, Clock } from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';

interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  type: 'book-count' | 'page-count' | 'genre-exploration' | 'author-discovery' | 'custom';
  target: number;
  duration: {
    startDate: any;
    endDate: any;
  };
  createdBy?: string;
  createdByEmail?: string;
  createdAt?: any;
  participantCount: number;
  isPublic?: boolean;
  tags: string[];
  status: 'upcoming' | 'active' | 'completed';
  reward?: {
    badgeName: string;
    points: number;
    description: string;
  };
}

interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  currentProgress: number;
  isCompleted: boolean;
  joinedAt: any;
  completedAt?: any;
}

interface ChallengeCardProps {
  challenge: ReadingChallenge;
  userProgress?: UserChallengeProgress;
  isFeatured?: boolean;
  isOwner?: boolean;
}

export function ChallengeCard({ challenge, userProgress, isFeatured = false, isOwner = false }: ChallengeCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book-count': return '📚';
      case 'page-count': return '📄';
      case 'genre-exploration': return '🎭';
      case 'author-discovery': return '✍️';
      default: return '🎯';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'book-count': return 'Books';
      case 'page-count': return 'Pages';
      case 'genre-exploration': return 'Genres';
      case 'author-discovery': return 'Authors';
      default: return 'Custom';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = userProgress ? (userProgress.currentProgress / challenge.target) * 100 : 0;
  const isJoined = !!userProgress;
  const isCompleted = userProgress?.isCompleted || false;

  const startDate = challenge.duration.startDate instanceof Date 
    ? challenge.duration.startDate 
    : challenge.duration.startDate?.toDate();
  const endDate = challenge.duration.endDate instanceof Date 
    ? challenge.duration.endDate 
    : challenge.duration.endDate?.toDate();

  const now = new Date();
  const hasStarted = startDate && isBefore(startDate, now);
  const hasEnded = endDate && isAfter(now, endDate);

  return (
    <Card className={`h-full hover:shadow-lg transition-shadow ${isFeatured ? 'border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-l-4 border-l-blue-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(challenge.status)}>
              {challenge.status}
            </Badge>
            {isFeatured && (
              <Badge className="bg-yellow-100 text-yellow-800">
                ⭐ Featured
              </Badge>
            )}
            {isOwner && (
              <Badge variant="outline" className="text-xs">
                Owner
              </Badge>
            )}
          </div>
          {challenge.reward && (
            <Trophy className="w-4 h-4 text-yellow-600" />
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2 flex items-center">
          <span className="mr-2">{getTypeIcon(challenge.type)}</span>
          {challenge.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">{challenge.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{challenge.target} {getTypeText(challenge.type)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{challenge.participantCount} participants</span>
          </div>
        </div>

        {isJoined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {userProgress?.currentProgress || 0} / {challenge.target}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800 w-full justify-center">
                ✅ Completed!
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2 text-xs text-gray-500">
          {startDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                Starts: {formatDistanceToNow(startDate, { addSuffix: true })}
              </span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>
                Ends: {formatDistanceToNow(endDate, { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {challenge.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {challenge.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{challenge.tags.length - 3} more
            </Badge>
          )}
        </div>

        {challenge.reward && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {challenge.reward.badgeName}
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              +{challenge.reward.points} points • {challenge.reward.description}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          {!isJoined && hasStarted && !hasEnded && (
            <Button size="sm" className="flex-1">
              Join Challenge
            </Button>
          )}
          {hasStarted && (
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
          )}
          {!hasStarted && (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              Coming Soon
            </Button>
          )}
        </div>

        {challenge.createdByEmail && (
          <div className="text-xs text-gray-500">
            Created by {challenge.createdByEmail}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
