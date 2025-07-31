'use client';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { getBookRecommendations } from '../actions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [readingHistory, setReadingHistory] = useState('I enjoyed "Dune" for its world-building and political intrigue, and "Project Hail Mary" for its clever problem-solving and humor.');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    const result = await getBookRecommendations({ readingHistory });

    if (result.success) {
      setRecommendations(result.data.recommendations);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (authLoading || !user) {
      return (
          <AppLayout>
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Recommendations</h2>
      </div>
      <p className="text-muted-foreground">
        Tell us about books you've enjoyed, and our AI will suggest what to read next.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Reading History</CardTitle>
            <CardDescription>
              Describe some books or genres you like. The more detail, the better!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="reading-history">What have you been reading?</Label>
                <Textarea
                  placeholder="e.g., I love fantasy novels with complex magic systems like..."
                  id="reading-history"
                  value={readingHistory}
                  onChange={(e) => setReadingHistory(e.target.value)}
                  rows={8}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Recommendations
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Your Next Favorite Books</CardTitle>
            <CardDescription>
              Based on your history, here are some books you might love.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {!loading && recommendations.length === 0 && !error && (
              <div className="text-center text-muted-foreground py-16">
                Your recommendations will appear here.
              </div>
            )}
            {recommendations.length > 0 && (
              <ul className="space-y-2 list-disc pl-5">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
