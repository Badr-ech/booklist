import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  addBookToCustomList, 
  removeBookFromCustomList,
  getBookCustomLists,
  createCustomList
} from '@/lib/custom-lists';
import { CustomList, Book } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  BookmarkPlus, 
  BookOpen, 
  Check, 
  Plus,
  Minus
} from 'lucide-react';

interface AddToCustomListProps {
  book: Pick<Book, 'id' | 'title' | 'author' | 'coverImage' | 'genre'>;
  variant?: 'button' | 'dropdown-item';
  className?: string;
}

export function AddToCustomList({ book, variant = 'button', className }: AddToCustomListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [userLists, setUserLists] = useState<CustomList[]>([]);
  const [bookLists, setBookLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedNote, setSelectedNote] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadLists();
    }
  }, [isOpen, user]);

  const loadLists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [allLists, currentBookLists] = await Promise.all([
        getUserCustomLists(user.uid),
        getBookCustomLists(user.uid, book.id)
      ]);
      
      setUserLists(allLists);
      setBookLists(currentBookLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (list: CustomList) => {
    if (!user) return;

    const result = await addBookToCustomList(list.id, book, selectedNote.trim() || undefined);

    if (result.success) {
      toast({
        title: 'Added to List!',
        description: `"${book.title}" has been added to "${list.name}".`,
      });
      await loadLists();
      setSelectedNote('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add book to list.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromList = async (list: CustomList) => {
    if (!user) return;

    const result = await removeBookFromCustomList(list.id, book.id);

    if (result.success) {
      toast({
        title: 'Removed from List',
        description: `"${book.title}" has been removed from "${list.name}".`,
      });
      await loadLists();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove book from list.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAndAdd = async () => {
    if (!user || !newListName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name.',
        variant: 'destructive',
      });
      return;
    }

    const createResult = await createCustomList(user.uid, newListName.trim());

    if (createResult.success && createResult.id) {
      const addResult = await addBookToCustomList(
        createResult.id, 
        book, 
        selectedNote.trim() || undefined
      );

      if (addResult.success) {
        toast({
          title: 'List Created & Book Added!',
          description: `Created "${newListName}" and added "${book.title}".`,
        });
        setNewListName('');
        setSelectedNote('');
        setIsCreatingNew(false);
        await loadLists();
      } else {
        toast({
          title: 'Error',
          description: addResult.error || 'Failed to add book to new list.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: createResult.error || 'Failed to create list.',
        variant: 'destructive',
      });
    }
  };

  const isBookInList = (list: CustomList) => {
    return bookLists.some(bl => bl.id === list.id);
  };

  const trigger = variant === 'dropdown-item' ? (
    <DropdownMenuItem onClick={() => setIsOpen(true)}>
      <BookmarkPlus className="h-4 w-4 mr-2" />
      Add to List
    </DropdownMenuItem>
  ) : (
    <Button onClick={() => setIsOpen(true)} variant="outline" className={className}>
      <BookmarkPlus className="h-4 w-4 mr-2" />
      Add to List
    </Button>
  );

  return (
    <>
      {trigger}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Add to Custom List
            </DialogTitle>
            <DialogDescription>
              Add "{book.title}" to one of your custom lists.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Optional note for the book */}
            <div className="space-y-2">
              <Label htmlFor="book-note">Note (Optional)</Label>
              <Textarea
                id="book-note"
                value={selectedNote}
                onChange={(e) => setSelectedNote(e.target.value)}
                placeholder="Why is this book in this list?"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Existing lists */}
            <div className="space-y-2">
              <Label>Your Lists</Label>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : userLists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You don't have any custom lists yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userLists.map((list) => {
                    const isInList = isBookInList(list);
                    return (
                      <div
                        key={list.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{list.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {list.bookCount} books
                            </Badge>
                            {isInList && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isInList ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromList(list)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToList(list)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create new list */}
            <div className="space-y-2">
              {isCreatingNew ? (
                <div className="space-y-2">
                  <Label htmlFor="new-list-name">New List Name</Label>
                  <Input
                    id="new-list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Summer Reading, Must-Reads..."
                    maxLength={50}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAndAdd} size="sm" className="flex-1">
                      Create & Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setNewListName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
