import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  getUserCustomLists, 
  createCustomList, 
  updateCustomList, 
  deleteCustomList,
  getCustomListBooks
} from '@/lib/custom-lists';
import { CustomList, CustomListBook } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface CustomListManagerProps {
  className?: string;
}

export function CustomListManager({ className }: CustomListManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [selectedListBooks, setSelectedListBooks] = useState<CustomListBook[]>([]);
  const [viewingList, setViewingList] = useState<CustomList | null>(null);
  
  // Form states
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListIsPublic, setNewListIsPublic] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserLists();
    }
  }, [user]);

  const loadUserLists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userLists = await getUserCustomLists(user.uid);
      setLists(userLists);
    } catch (error) {
      console.error('Error loading lists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your lists.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name.',
        variant: 'destructive',
      });
      return;
    }

    const result = await createCustomList(
      user.uid,
      newListName.trim(),
      newListDescription.trim() || undefined,
      newListIsPublic
    );

    if (result.success) {
      toast({
        title: 'List Created!',
        description: `"${newListName}" has been created.`,
      });
      setNewListName('');
      setNewListDescription('');
      setNewListIsPublic(false);
      setIsCreateDialogOpen(false);
      await loadUserLists();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create list.',
        variant: 'destructive',
      });
    }
  };

  const handleEditList = async () => {
    if (!selectedList || !newListName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name.',
        variant: 'destructive',
      });
      return;
    }

    const result = await updateCustomList(selectedList.id, {
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
      isPublic: newListIsPublic,
    });

    if (result.success) {
      toast({
        title: 'List Updated!',
        description: `"${newListName}" has been updated.`,
      });
      setIsEditDialogOpen(false);
      setSelectedList(null);
      await loadUserLists();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update list.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async (list: CustomList) => {
    if (!confirm(`Are you sure you want to delete "${list.name}"? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteCustomList(list.id);

    if (result.success) {
      toast({
        title: 'List Deleted',
        description: `"${list.name}" has been deleted.`,
      });
      await loadUserLists();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete list.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (list: CustomList) => {
    setSelectedList(list);
    setNewListName(list.name);
    setNewListDescription(list.description || '');
    setNewListIsPublic(list.isPublic);
    setIsEditDialogOpen(true);
  };

  const viewListBooks = async (list: CustomList) => {
    setViewingList(list);
    const books = await getCustomListBooks(list.id);
    setSelectedListBooks(books);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Custom Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Custom Lists ({lists.length})
            </CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom lists yet.</p>
              <p className="text-sm">Create themed collections of your favorite books!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => viewListBooks(list)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{list.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {list.bookCount} books
                      </Badge>
                      {list.isPublic ? (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {list.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {list.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(list.createdAt)}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewListBooks(list)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Books
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(list)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit List
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteList(list)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a custom list to organize your books by theme, mood, or any category you like.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Summer Reading, Sci-Fi Favorites..."
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description">Description (Optional)</Label>
              <Textarea
                id="list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="What's this list about?"
                maxLength={200}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public-list"
                checked={newListIsPublic}
                onCheckedChange={setNewListIsPublic}
              />
              <Label htmlFor="public-list">Make this list public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update your list details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-list-name">List Name</Label>
              <Input
                id="edit-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-list-description">Description (Optional)</Label>
              <Textarea
                id="edit-list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                maxLength={200}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-public-list"
                checked={newListIsPublic}
                onCheckedChange={setNewListIsPublic}
              />
              <Label htmlFor="edit-public-list">Make this list public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditList}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View List Books Dialog */}
      <Dialog open={!!viewingList} onOpenChange={() => setViewingList(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {viewingList?.name}
            </DialogTitle>
            <DialogDescription>
              {viewingList?.description || 'Books in this list'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {selectedListBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No books in this list yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedListBooks.map((listBook) => (
                  <div key={listBook.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Image
                      src={listBook.bookCover}
                      alt={listBook.bookTitle}
                      width={40}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <Link 
                        href={`/book/${listBook.bookId}`}
                        className="font-medium hover:text-primary line-clamp-1"
                      >
                        {listBook.bookTitle}
                      </Link>
                      <p className="text-sm text-muted-foreground">{listBook.bookAuthor}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {listBook.bookGenre}
                      </Badge>
                      {listBook.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{listBook.note}"
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {formatDate(listBook.addedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
