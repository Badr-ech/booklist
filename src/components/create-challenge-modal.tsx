'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChallengeModal({ isOpen, onClose }: CreateChallengeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'book-count' as 'book-count' | 'page-count' | 'genre-exploration' | 'author-discovery' | 'custom',
    target: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isPublic: true,
    tags: [] as string[],
    rewardBadgeName: '',
    rewardPoints: '',
    rewardDescription: ''
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.target) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const target = parseInt(formData.target);
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Invalid Target",
        description: "Please enter a valid target number.",
        variant: "destructive"
      });
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const challengeData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        target: target,
        duration: {
          startDate: formData.startDate,
          endDate: formData.endDate
        },
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        participantCount: 1,
        isPublic: formData.isPublic,
        tags: formData.tags,
        status: formData.startDate > new Date() ? 'upcoming' : 'active'
      };

      // Add reward if specified
      if (formData.rewardBadgeName.trim()) {
        challengeData.reward = {
          badgeName: formData.rewardBadgeName.trim(),
          points: parseInt(formData.rewardPoints) || 50,
          description: formData.rewardDescription.trim() || 'Completed the challenge'
        };
      }

      await addDoc(collection(db, 'readingChallenges'), challengeData);

      toast({
        title: "Challenge Created",
        description: "Your reading challenge has been created successfully!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'book-count',
        target: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isPublic: true,
        tags: [],
        rewardBadgeName: '',
        rewardPoints: '',
        rewardDescription: ''
      });
      setNewTag('');
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const challengeTypes = [
    { value: 'book-count', label: '📚 Book Count', description: 'Read a specific number of books' },
    { value: 'page-count', label: '📄 Page Count', description: 'Read a certain number of pages' },
    { value: 'genre-exploration', label: '🎭 Genre Exploration', description: 'Explore different genres' },
    { value: 'author-discovery', label: '✍️ Author Discovery', description: 'Read books by new authors' },
    { value: 'custom', label: '🎯 Custom Challenge', description: 'Create your own challenge type' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Reading Challenge</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Summer Reading Marathon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your challenge and what participants should expect..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Challenge Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {challengeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target *</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                placeholder="e.g., 12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isPublic">Public Challenge</Label>
              <p className="text-sm text-gray-500">Allow others to discover and join your challenge</p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Reward Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-yellow-50">
            <h4 className="font-medium text-sm flex items-center">
              🏆 Challenge Reward (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rewardBadgeName">Badge Name</Label>
                <Input
                  id="rewardBadgeName"
                  value={formData.rewardBadgeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewardBadgeName: e.target.value }))}
                  placeholder="e.g., Summer Reader"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rewardPoints">Points</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  min="1"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewardPoints: e.target.value }))}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewardDescription">Reward Description</Label>
              <Input
                id="rewardDescription"
                value={formData.rewardDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, rewardDescription: e.target.value }))}
                placeholder="Completed the summer reading challenge"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
