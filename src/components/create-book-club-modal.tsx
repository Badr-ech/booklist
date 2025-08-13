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
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateBookClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBookClubModal({ isOpen, onClose }: CreateBookClubModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meetingFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    isPublic: true,
    maxMembers: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the name and description.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookClubs'), {
        name: formData.name.trim(),
        description: formData.description.trim(),
        schedule: {
          meetingFrequency: formData.meetingFrequency,
          timeZone: formData.timeZone,
          nextMeeting: null
        },
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        memberCount: 1,
        isPublic: formData.isPublic,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        tags: formData.tags,
        status: 'active',
        currentBook: null
      });

      toast({
        title: "Book Club Created",
        description: "Your book club has been created successfully!"
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        meetingFrequency: 'monthly',
        isPublic: true,
        maxMembers: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tags: []
      });
      setNewTag('');
      onClose();
    } catch (error) {
      console.error('Error creating book club:', error);
      toast({
        title: "Error",
        description: "Failed to create book club. Please try again.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Book Club</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Classic Literature Book Club"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your book club's focus, goals, and what members can expect..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Meeting Frequency</Label>
            <Select value={formData.meetingFrequency} onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => setFormData(prev => ({ ...prev, meetingFrequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members (Optional)</Label>
            <Input
              id="maxMembers"
              type="number"
              min="2"
              max="100"
              value={formData.maxMembers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: e.target.value }))}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isPublic">Public Club</Label>
              <p className="text-sm text-gray-500">Allow anyone to discover and join your club</p>
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
            <p className="text-xs text-gray-500">Examples: sci-fi, classics, young-adult, non-fiction</p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Book Club'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
