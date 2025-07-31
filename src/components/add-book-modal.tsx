'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Star } from 'lucide-react';
import { useState } from 'react';
import type { Book, BookStatus, BookClient } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onAddBook: (details: BookClient) => Promise<void>;
  initialData?: Book | null;
}

export function AddBookModal({ isOpen, onClose, book, onAddBook, initialData }: AddBookModalProps) {
  const [status, setStatus] = useState<BookStatus>(initialData?.status || 'plan-to-read');
  const [rating, setRating] = useState<number | undefined>(initialData?.rating || undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate instanceof Date ? initialData.startDate : 
    initialData?.startDate ? new Date() : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate instanceof Date ? initialData.endDate : 
    initialData?.endDate ? new Date() : undefined
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onAddBook({ status, rating, startDate, endDate });
    setLoading(false);
  };

  const statusOptions: { value: BookStatus; label: string }[] = [
    { value: 'plan-to-read', label: 'Plan to Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Your List</DialogTitle>
          <DialogDescription>
            Add &quot;{book.title}&quot; to one of your lists and track your reading progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => setStatus(value as BookStatus)} defaultValue={status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <div className="col-span-3 flex items-center">
              {[...Array(10)].map((_, i) => (
                <button key={i} onClick={() => setRating(rating === i + 1 ? undefined : i + 1)}>
                  <Star
                    className={cn(
                      'h-6 w-6 cursor-pointer',
                      (rating ?? 0) > i ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn('col-span-3 justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn('col-span-3 justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
