import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, ReadingStats } from '@/lib/types';
import { Target, Edit3, Check, X } from 'lucide-react';

interface ReadingGoalManagerProps {
  profile: UserProfile;
  stats: ReadingStats;
  onUpdateGoal: (goal: number) => Promise<void>;
}

export function ReadingGoalManager({ profile, stats, onUpdateGoal }: ReadingGoalManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(profile.readingGoal?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const hasGoal = profile.readingGoal && profile.readingGoal > 0;
  const isGoalAchieved = hasGoal && stats.booksThisYear >= profile.readingGoal!;
  const goalProgress = hasGoal ? (stats.booksThisYear / profile.readingGoal!) * 100 : 0;

  const handleSaveGoal = async () => {
    const goal = parseInt(goalInput);
    
    if (isNaN(goal) || goal < 1) {
      toast({
        title: 'Invalid Goal',
        description: 'Please enter a valid number greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (goal > 365) {
      toast({
        title: 'Goal Too High',
        description: 'Reading goal cannot exceed 365 books per year.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateGoal(goal);
      setIsEditing(false);
      toast({
        title: 'Goal Updated!',
        description: `Your ${currentYear} reading goal is now ${goal} books.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reading goal.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setGoalInput(profile.readingGoal?.toString() || '');
    setIsEditing(false);
  };

  const getBooksNeededPerMonth = (): number => {
    if (!hasGoal) return 0;
    const currentMonth = new Date().getMonth() + 1;
    const remainingMonths = 12 - currentMonth + 1;
    const remainingBooks = profile.readingGoal! - stats.booksThisYear;
    return Math.max(0, Math.ceil(remainingBooks / remainingMonths));
  };

  const getDaysRemaining = (): number => {
    const endOfYear = new Date(currentYear, 11, 31);
    const today = new Date();
    return Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!hasGoal && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set a Reading Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set an annual reading goal to track your progress and stay motivated!
          </p>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Set {currentYear} Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isGoalAchieved ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {currentYear} Reading Goal
            {isGoalAchieved && <span className="text-green-600">🎉</span>}
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reading-goal">Books to read in {currentYear}</Label>
              <Input
                id="reading-goal"
                type="number"
                min="1"
                max="365"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g., 24"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveGoal}
                disabled={isUpdating}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Goal'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">
                {stats.booksThisYear} / {profile.readingGoal}
              </div>
              <p className="text-sm text-muted-foreground">
                books completed
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={Math.min(goalProgress, 100)} className="w-full h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goalProgress.toFixed(1)}% complete</span>
                <span>{getDaysRemaining()} days left</span>
              </div>
            </div>

            {isGoalAchieved ? (
              <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🎉 Congratulations! You've achieved your reading goal!
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Consider setting a higher goal for next year.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="text-lg font-semibold">
                    {profile.readingGoal! - stats.booksThisYear}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    books to go
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="text-lg font-semibold">
                    {getBooksNeededPerMonth()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    per month needed
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>This month:</span>
                <span className="font-medium">{stats.booksThisMonth} books</span>
              </div>
              <div className="flex justify-between">
                <span>Average per month:</span>
                <span className="font-medium">
                  {(stats.booksThisYear / Math.max(new Date().getMonth() + 1, 1)).toFixed(1)} books
                </span>
              </div>
              {goalProgress > 0 && (
                <div className="flex justify-between">
                  <span>On track for:</span>
                  <span className="font-medium">
                    {Math.round((stats.booksThisYear / (new Date().getMonth() + 1)) * 12)} books
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
