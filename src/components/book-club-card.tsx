'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface BookClub {
  id: string;
  name: string;
  description: string;
  currentBook?: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  schedule: {
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    nextMeeting?: any;
    timeZone: string;
  };
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  memberCount: number;
  isPublic: boolean;
  maxMembers?: number;
  tags: string[];
  status: 'active' | 'on-hold' | 'completed';
}

interface BookClubCardProps {
  club: BookClub;
  isOwner?: boolean;
}

export function BookClubCard({ club, isOwner = false }: BookClubCardProps) {
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(club.status)}>
            {club.status}
          </Badge>
          {isOwner && (
            <Badge variant="outline" className="text-xs">
              Owner
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{club.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">{club.description}</p>
        
        {club.currentBook && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img 
              src={club.currentBook.coverImage} 
              alt={club.currentBook.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{club.currentBook.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{club.currentBook.author}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {club.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {club.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{club.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{club.memberCount}{club.maxMembers ? `/${club.maxMembers}` : ''} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getFrequencyText(club.schedule.meetingFrequency)}</span>
            </div>
          </div>
          
          {club.schedule.nextMeeting && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                Next: {formatDistanceToNow(club.schedule.nextMeeting.toDate(), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Link href={`/book-clubs/${club.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-xs">
              View Details
            </Button>
          </Link>
          {!isOwner && club.status === 'active' && (
            <Button size="sm" className="text-xs">
              Join Club
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created by {club.createdByEmail}
        </div>
      </CardContent>
    </Card>
  );
}
