"use client";

import { useState, useEffect } from 'react';
import { ArrowUpDown, Calendar, Star, ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { BookReview } from '@/lib/types';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAuth } from './auth-provider';
import { voteOnReview, addReviewComment, reportReview, getReviewVotes, getReviewComments } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type SortOption = 'newest' | 'oldest' | 'highest-rating' | 'lowest-rating' | 'most-helpful' | 'most-comments';

interface EnhancedReviewListProps {
  reviews: BookReview[];
  bookId: string;
}

interface ReviewWithExtras extends BookReview {
  votes?: number;
  hasVoted?: boolean;
  comments?: any[];
  commentCount?: number;
}

export function EnhancedReviewList({ reviews, bookId }: EnhancedReviewListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewsWithExtras, setReviewsWithExtras] = useState<ReviewWithExtras[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReview, setReportingReview] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingReview, setCommentingReview] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadReviewExtras();
  }, [reviews, user]);

  const loadReviewExtras = async () => {
    const enhanced = await Promise.all(
      reviews.map(async (review) => {
        try {
          const [votesResult, commentsResult] = await Promise.all([
            getReviewVotes(review.id),
            getReviewComments(review.id)
          ]);

          const votes = votesResult.success ? votesResult.data : { total: 0, helpful: 0, unhelpful: 0 };
          const comments = commentsResult.success ? commentsResult.data : [];

          return {
            ...review,
            votes: votes?.total || 0,
            hasVoted: false, // This would need additional logic to check user votes
            comments,
            commentCount: comments?.length || 0
          };
        } catch (error) {
          console.error('Error loading review extras:', error);
          return {
            ...review,
            votes: 0,
            hasVoted: false,
            comments: [],
            commentCount: 0
          };
        }
      })
    );

    setReviewsWithExtras(enhanced);
  };

  const handleVote = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to vote on reviews",
        variant: "destructive"
      });
      return;
    }

    try {
      await voteOnReview({ 
        userId: user.uid, 
        reviewId, 
        voteType: 'helpful' 
      });
      toast({
        title: "Success",
        description: "Vote recorded successfully"
      });
      loadReviewExtras();
    } catch (error) {
      console.error('Error voting on review:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentingReview || !newComment.trim()) return;

    try {
      await addReviewComment({
        reviewId: commentingReview,
        userId: user.uid,
        userEmail: user.email || '',
        comment: newComment.trim()
      });

      toast({
        title: "Success",
        description: "Comment added successfully"
      });

      setNewComment('');
      setShowCommentModal(false);
      setCommentingReview(null);
      loadReviewExtras();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleReportReview = async () => {
    if (!user || !reportingReview || !reportReason) return;

    try {
      await reportReview({
        userId: user.uid,
        reviewId: reportingReview,
        reason: reportReason,
        description: reportDescription
      });

      toast({
        title: "Success",
        description: "Review reported successfully"
      });

      setReportReason('');
      setReportDescription('');
      setShowReportModal(false);
      setReportingReview(null);
    } catch (error) {
      console.error('Error reporting review:', error);
      toast({
        title: "Error",
        description: "Failed to report review",
        variant: "destructive"
      });
    }
  };

  const sortedAndFilteredReviews = reviewsWithExtras
    .filter(review => 
      review.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'oldest':
          return a.createdAt.seconds - b.createdAt.seconds;
        case 'highest-rating':
          return (b.helpful || 0) - (a.helpful || 0);
        case 'lowest-rating':
          return (a.helpful || 0) - (b.helpful || 0);
        case 'most-helpful':
          return (b.votes || 0) - (a.votes || 0);
        case 'most-comments':
          return (b.commentCount || 0) - (a.commentCount || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-helpful">Most Helpful</SelectItem>
              <SelectItem value="most-comments">Most Comments</SelectItem>
              <SelectItem value="highest-rating">Highest Rating</SelectItem>
              <SelectItem value="lowest-rating">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {searchQuery ? 'No reviews match your search.' : 'No reviews yet.'}
          </div>
        ) : (
          sortedAndFilteredReviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {review.userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{review.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(review.createdAt.toDate())} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor((review.helpful || 0) / 2) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReportingReview(review.id);
                        setShowReportModal(true);
                      }}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Review Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{review.review}</p>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={review.hasVoted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(review.id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.votes || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCommentingReview(review.id);
                        setShowCommentModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comment ({review.commentCount || 0})
                    </Button>
                  </div>
                </div>

                {/* Comments */}
                {review.comments && review.comments.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {review.comments.slice(0, 3).map((comment: any) => (
                      <div key={comment.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.userEmail}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt.toDate())} ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                    {review.comments.length > 3 && (
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        View {review.comments.length - 3} more comments
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your comment</Label>
              <Textarea
                placeholder="Share your thoughts on this review..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for report *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam or promotional content</SelectItem>
                  <SelectItem value="harassment">Harassment or hate speech</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="spoilers">Contains spoilers</SelectItem>
                  <SelectItem value="fake">Fake or misleading review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional details (optional)</Label>
              <Textarea
                placeholder="Provide more context about this report..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReportReview}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
