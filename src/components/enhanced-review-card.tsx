'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Flag, 
  ChevronDown, 
  ChevronUp,
  Star,
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { voteOnReview, getReviewVotes, addReviewComment, getReviewComments, reportReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userEmail: string;
  review: string;
  rating?: number;
  createdAt: any;
  helpful?: number;
  spoilerWarning?: boolean;
  tags?: string[];
}

interface ReviewVotes {
  helpful: number;
  unhelpful: number;
  total: number;
}

interface ReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  userEmail: string;
  comment: string;
  createdAt: any;
  isEdited: boolean;
}

interface EnhancedReviewCardProps {
  review: BookReview;
  currentUserId?: string;
}

export function EnhancedReviewCard({ review, currentUserId }: EnhancedReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState<ReviewVotes>({ helpful: 0, unhelpful: 0, total: 0 });
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    loadReviewData();
  }, [review.id]);

  const loadReviewData = async () => {
    try {
      // Load votes
      const votesResult = await getReviewVotes(review.id);
      if (votesResult.success && votesResult.data) {
        setVotes(votesResult.data);
      }

      // Load comments
      const commentsResult = await getReviewComments(review.id);
      if (commentsResult.success && commentsResult.data) {
        setComments(commentsResult.data as ReviewComment[]);
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    }
  };

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on reviews.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await voteOnReview({
        userId: user.uid,
        reviewId: review.id,
        voteType
      });

      if (result.success) {
        // Update local state based on action
        if (result.action === 'added') {
          setUserVote(voteType);
          setVotes(prev => ({
            ...prev,
            [voteType]: prev[voteType] + 1,
            total: prev.total + 1
          }));
        } else if (result.action === 'updated') {
          const oldVoteType = voteType === 'helpful' ? 'unhelpful' : 'helpful';
          setUserVote(voteType);
          setVotes(prev => ({
            ...prev,
            [voteType]: prev[voteType] + 1,
            [oldVoteType]: prev[oldVoteType] - 1
          }));
        } else if (result.action === 'removed') {
          setUserVote(null);
          setVotes(prev => ({
            ...prev,
            [voteType]: prev[voteType] - 1,
            total: prev.total - 1
          }));
        }

        toast({
          title: "Vote Recorded",
          description: "Thank you for your feedback!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const result = await addReviewComment({
        userId: user.uid,
        userEmail: user.email!,
        reviewId: review.id,
        comment: newComment
      });

      if (result.success) {
        setNewComment('');
        loadReviewData(); // Reload comments
        toast({
          title: "Comment Added",
          description: "Your comment has been posted!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user || !reportReason) return;

    try {
      const result = await reportReview({
        userId: user.uid,
        reviewId: review.id,
        reason: reportReason,
        description: reportDescription
      });

      if (result.success) {
        setShowReportDialog(false);
        setReportReason('');
        setReportDescription('');
        toast({
          title: "Report Submitted",
          description: "Thank you for reporting. We'll review this content."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLongReview = review.review.length > 300;
  const displayReview = showFullReview || !isLongReview 
    ? review.review 
    : review.review.substring(0, 300) + '...';

  const reportReasons = [
    'Spam or inappropriate content',
    'Spoilers without warning',
    'Offensive language',
    'Off-topic discussion',
    'Copyright violation',
    'Other'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{review.userEmail}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {review.createdAt && formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {review.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{review.rating}/10</span>
              </div>
            )}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reason for reporting</Label>
                    <Select value={reportReason} onValueChange={setReportReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional details (optional)</Label>
                    <Textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Provide more context about why you're reporting this review..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReport} disabled={!reportReason}>
                      Submit Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {review.spoilerWarning && (
          <Badge variant="destructive" className="text-xs">
            ⚠️ Contains Spoilers
          </Badge>
        )}
        
        <div className="space-y-2">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {displayReview}
          </p>
          {isLongReview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullReview(!showFullReview)}
              className="text-blue-600 p-0 h-auto"
            >
              {showFullReview ? (
                <>
                  Show less <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Voting and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={userVote === 'helpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('helpful')}
                disabled={!user}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Helpful ({votes.helpful})
              </Button>
              <Button
                variant={userVote === 'unhelpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('unhelpful')}
                disabled={!user}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                ({votes.unhelpful})
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comments ({comments.length})
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {user && (
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || loading}
                    size="sm"
                  >
                    {loading ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{comment.userEmail}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt && formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                      {comment.isEdited && ' (edited)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
