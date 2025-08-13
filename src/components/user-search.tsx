'use client';

import { useState } from 'react';
import { searchUsers } from '@/app/actions';
import { useAuth } from '@/components/auth-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FollowButton } from '@/components/follow-button';
import { Search, Users, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect } from 'react';

interface UserSearchResult {
  id: string;
  email: string;
  username?: string;
  favoriteGenre?: string;
  bio?: string;
}

export function UserSearch() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.trim() && debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async (term: string) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const result = await searchUsers({ searchTerm: term });
      
      if (result.success) {
        // Filter out the current user from results
        const filteredResults = (result.data || []).filter(
          (resultUser: any) => resultUser.id !== user?.uid
        ) as UserSearchResult[];
        setResults(filteredResults);
      } else {
        console.error('Search error:', result.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string, username?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string, username?: string) => {
    return username || email.split('@')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Searching users...</span>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && searchTerm.trim() && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found for "{searchTerm}"</p>
            <p className="text-sm">Try searching with a different email address.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {results.length} user{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((resultUser) => (
              <div
                key={resultUser.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(resultUser.email, resultUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {getUserDisplayName(resultUser.email, resultUser.username)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {resultUser.email}
                    </p>
                    {resultUser.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {resultUser.bio}
                      </p>
                    )}
                    {resultUser.favoriteGenre && (
                      <p className="text-xs text-primary">
                        Favorite: {resultUser.favoriteGenre}
                      </p>
                    )}
                  </div>
                </div>
                <FollowButton
                  targetUserId={resultUser.id}
                  targetUserEmail={resultUser.email}
                  targetUsername={resultUser.username}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Search for users by email address</p>
            <p className="text-sm">Enter at least 2 characters to start searching</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
