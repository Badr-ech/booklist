"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Quote, FileText, Edit3, Trash2, Hash, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from './auth-provider';
import { BookNote } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { addBookNote, getUserBookNotes, updateBookNote, deleteBookNote } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface BookNotesManagerProps {
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
}

export function BookNotesManager({ bookId, bookTitle, bookCover }: BookNotesManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'note' | 'quote'>('all');
  const [selectedBook, setSelectedBook] = useState<string>(bookId || 'all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<BookNote | null>(null);

  // Form states
  const [newNote, setNewNote] = useState({
    content: '',
    noteType: 'note' as 'note' | 'quote',
    pageNumber: '',
    chapter: '',
    isPrivate: false,
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, bookId]);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotes = await getUserBookNotes(user.uid, bookId);
      setNotes(userNotes as BookNote[]);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !newNote.content.trim()) return;

    if (bookId && !bookTitle) {
      toast({
        title: "Error",
        description: "Book information is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const noteData = {
        userId: user.uid,
        bookId: bookId || '',
        bookTitle: bookTitle || '',
        bookCover: bookCover || '',
        noteType: newNote.noteType,
        content: newNote.content,
        pageNumber: newNote.pageNumber ? parseInt(newNote.pageNumber) : undefined,
        chapter: newNote.chapter || undefined,
        isPrivate: newNote.isPrivate,
        tags: newNote.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addBookNote(noteData);
      
      toast({
        title: "Success",
        description: `${newNote.noteType === 'note' ? 'Note' : 'Quote'} added successfully`
      });

      setNewNote({
        content: '',
        noteType: 'note',
        pageNumber: '',
        chapter: '',
        isPrivate: false,
        tags: [],
        tagInput: ''
      });
      setShowAddDialog(false);
      loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !newNote.content.trim()) return;

    try {
      const updates = {
        content: newNote.content,
        pageNumber: newNote.pageNumber ? parseInt(newNote.pageNumber) : undefined,
        chapter: newNote.chapter || undefined,
        isPrivate: newNote.isPrivate,
        tags: newNote.tags,
        updatedAt: new Date()
      };

      await updateBookNote(editingNote.id, updates);
      
      toast({
        title: "Success",
        description: "Note updated successfully"
      });

      setEditingNote(null);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteBookNote(noteId);
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewNote({
      content: '',
      noteType: 'note',
      pageNumber: '',
      chapter: '',
      isPrivate: false,
      tags: [],
      tagInput: ''
    });
  };

  const addTag = () => {
    if (newNote.tagInput.trim() && !newNote.tags.includes(newNote.tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = selectedType === 'all' || note.noteType === selectedType;
    const matchesBook = selectedBook === 'all' || note.bookId === selectedBook;
    
    return matchesSearch && matchesType && matchesBook;
  });

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const bookKey = `${note.bookId}-${note.bookTitle}`;
    if (!acc[bookKey]) {
      acc[bookKey] = {
        bookId: note.bookId,
        bookTitle: note.bookTitle,
        bookCover: note.bookCover,
        notes: []
      };
    }
    acc[bookKey].notes.push(note);
    return acc;
  }, {} as Record<string, { bookId: string; bookTitle: string; bookCover: string; notes: BookNote[] }>);

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Please log in to manage your book notes and quotes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Book Notes & Quotes</h2>
          <p className="text-muted-foreground">Keep track of your thoughts and favorite quotes</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingNote(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add {bookId ? (newNote.noteType === 'note' ? 'Note' : 'Quote') : 'Note/Quote'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Edit' : 'Add'} {newNote.noteType === 'note' ? 'Note' : 'Quote'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {!bookId && (
                <div>
                  <Label>Book Title *</Label>
                  <Input 
                    placeholder="Enter book title" 
                    required
                  />
                </div>
              )}

              <Tabs value={newNote.noteType} onValueChange={(value) => setNewNote(prev => ({ ...prev, noteType: value as 'note' | 'quote' }))}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="note" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Note
                  </TabsTrigger>
                  <TabsTrigger value="quote" className="flex items-center gap-2">
                    <Quote className="w-4 h-4" />
                    Quote
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div>
                <Label>Content *</Label>
                <Textarea
                  placeholder={newNote.noteType === 'note' ? "Your thoughts about this book..." : "\"Enter the quote here...\""}
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page Number</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 123"
                    value={newNote.pageNumber}
                    onChange={(e) => setNewNote(prev => ({ ...prev, pageNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Chapter</Label>
                  <Input
                    placeholder="e.g., Chapter 5"
                    value={newNote.chapter}
                    onChange={(e) => setNewNote(prev => ({ ...prev, chapter: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={newNote.tagInput}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newNote.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={newNote.isPrivate}
                  onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, isPrivate: checked }))}
                />
                <Label htmlFor="private">Keep private</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingNote(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={editingNote ? handleEditNote : handleAddNote}>
                  {editingNote ? 'Update' : 'Add'} {newNote.noteType === 'note' ? 'Note' : 'Quote'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      {!bookId && (
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes and quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'all' | 'note' | 'quote')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
              <SelectItem value="quote">Quotes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes Display */}
      {loading ? (
        <div className="text-center p-8">Loading notes...</div>
      ) : Object.keys(groupedNotes).length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No notes or quotes yet.</p>
          <p className="text-sm">Start adding your thoughts and favorite quotes!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedNotes).map(bookGroup => (
            <Card key={`${bookGroup.bookId}-${bookGroup.bookTitle}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {bookGroup.bookCover && (
                    <img 
                      src={bookGroup.bookCover} 
                      alt={bookGroup.bookTitle}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{bookGroup.bookTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {bookGroup.notes.length} {bookGroup.notes.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookGroup.notes.map(note => (
                    <div key={note.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {note.noteType === 'quote' ? (
                            <Quote className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-500" />
                          )}
                          <Badge variant={note.noteType === 'quote' ? 'default' : 'secondary'}>
                            {note.noteType}
                          </Badge>
                          {note.isPrivate && (
                            <Badge variant="outline" className="text-xs">Private</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNote(note);
                              setNewNote({
                                content: note.content,
                                noteType: note.noteType,
                                pageNumber: note.pageNumber?.toString() || '',
                                chapter: note.chapter || '',
                                isPrivate: note.isPrivate,
                                tags: note.tags || [],
                                tagInput: ''
                              });
                              setShowAddDialog(true);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className={note.noteType === 'quote' ? 'italic border-l-4 border-blue-200 pl-4' : ''}>
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                      
                      {(note.pageNumber || note.chapter) && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {note.pageNumber && (
                            <span>Page {note.pageNumber}</span>
                          )}
                          {note.chapter && (
                            <span>{note.chapter}</span>
                          )}
                        </div>
                      )}
                      
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          Added {formatDistanceToNow(note.createdAt instanceof Date ? note.createdAt : note.createdAt.toDate())} ago
                        </span>
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span>
                            Updated {formatDistanceToNow(note.updatedAt instanceof Date ? note.updatedAt : note.updatedAt.toDate())} ago
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
