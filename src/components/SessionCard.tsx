
import React, { useState } from 'react';
import { Session, useMeetingContext } from '@/context/MeetingContext';
import { formatTime, isSlotInPast } from '@/utils/dateUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserPlus, User, Clock, Pencil, Trash2, AlertTriangle, PenTool, Code, Clipboard, Database } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

// Array of gradient background colors for the signed-up slots
const SLOT_GRADIENTS = [
  'bg-gradient-to-r from-blue-50 to-indigo-50',
  'bg-gradient-to-r from-green-50 to-emerald-50',
  'bg-gradient-to-r from-yellow-50 to-amber-50',
  'bg-gradient-to-r from-red-50 to-rose-50',
  'bg-gradient-to-r from-purple-50 to-violet-50',
  'bg-gradient-to-r from-pink-50 to-fuchsia-50',
  'bg-gradient-to-r from-indigo-50 to-sky-50',
  'bg-gradient-to-r from-amber-50 to-orange-50',
];

// Category definitions with their properties
const CATEGORIES = [
  { id: 'design', label: 'Design', icon: PenTool, color: 'bg-[#FFDEE2] text-[#D946EF]' },
  { id: 'engineering', label: 'Engineering', icon: Code, color: 'bg-[#D3E4FD] text-[#0EA5E9]' },
  { id: 'pm', label: 'PM', icon: Clipboard, color: 'bg-[#FDE1D3] text-[#F97316]' },
  { id: 'data-science', label: 'Data Science', icon: Database, color: 'bg-[#E5DEFF] text-[#8B5CF6]' },
];

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { signUpForSlot, cancelSignUp, getAvailableMinutes, isCurrentWeekInFuture } = useMeetingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(10); // Default to 10 minutes
  const [category, setCategory] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const isPast = isSlotInPast(session.startTime);
  const isDisabled = isPast; // Disable for past sessions
  
  const availableMinutes = getAvailableMinutes(session.id);
  const totalSessionMinutes = differenceInMinutes(session.endTime, session.startTime);
  
  const handleSignUp = () => {
    if (name.trim() && topic.trim() && duration > 0) {
      // Calculate end time based on selected duration
      const startTime = new Date(session.startTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + duration);
      
      if (editingSlot) {
        // First cancel the existing slot
        cancelSignUp(editingSlot);
      }
      
      signUpForSlot(session.id, startTime, endTime, name.trim(), topic.trim(), category);
      setIsDialogOpen(false);
      setEditingSlot(null);
      resetForm();
      
      toast({
        title: editingSlot ? "Successfully updated!" : "Successfully signed up!",
        description: `You're booked for ${formatTime(startTime)} - ${formatTime(endTime)}`,
      });
    }
  };
  
  const resetForm = () => {
    setName('');
    setTopic('');
    setDuration(10);
    setCategory(null);
  };
  
  const handleEdit = (slotId: string) => {
    const slotToEdit = session.slots.find(slot => slot.id === slotId);
    if (slotToEdit) {
      setName(slotToEdit.attendee || '');
      setTopic(slotToEdit.topic || '');
      setDuration(differenceInMinutes(slotToEdit.endTime, slotToEdit.startTime));
      setCategory(slotToEdit.category || null);
      setEditingSlot(slotId);
      setIsDialogOpen(true);
    }
  };
  
  const handleDeleteClick = (slotId: string) => {
    setSlotToDelete(slotId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (slotToDelete) {
      cancelSignUp(slotToDelete);
      setIsDeleteDialogOpen(false);
      setSlotToDelete(null);
      
      toast({
        title: "Sign-up removed",
        description: "Your time slot has been successfully removed",
      });
    }
  };
  
  const handleDialogOpen = () => {
    // Load user name from localStorage if available
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
    }
    setIsDialogOpen(true);
  };

  const getCategoryById = (categoryId: string | null) => {
    if (!categoryId) return null;
    return CATEGORIES.find(cat => cat.id === categoryId) || null;
  };
  
  return (
    <>
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <h3 className="text-lg font-semibold">{session.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatTime(session.startTime)}-{formatTime(session.endTime)}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center">
                  <span className="font-medium">Category:</span>
                  <span className="ml-1">General</span>
                </span>
              </div>
            </div>
            
            {session.slots.length > 0 ? (
              <div className="space-y-3 mt-4">
                {session.slots.map((slot, index) => {
                  const slotCategory = getCategoryById(slot.category);
                  const CategoryIcon = slotCategory?.icon;
                  
                  return (
                    <div 
                      key={slot.id}
                      className={cn(
                        "flex items-start gap-2 p-3 rounded-md relative group",
                        SLOT_GRADIENTS[index % SLOT_GRADIENTS.length]
                      )}
                    >
                      <User className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{slot.topic}</div>
                        <div className="text-xs text-muted-foreground">By {slot.attendee}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)} 
                          ({differenceInMinutes(slot.endTime, slot.startTime)} min)
                        </div>
                        
                        {slotCategory && (
                          <div className="mt-1.5">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs gap-1",
                              slotCategory.color
                            )}>
                              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                              {slotCategory.label}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => handleEdit(slot.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteClick(slot.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            
            <div className="text-center py-4">
              <p className="text-sm font-medium">{availableMinutes} min available</p>
            </div>
            
            <Button 
              className="w-full"
              disabled={isDisabled || availableMinutes <= 5} // Disable if past or less than 5 min available
              onClick={handleDialogOpen}
            >
              {isDisabled ? "Past session" : availableMinutes <= 5 ? "Insufficient time" : "Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Edit sign-up" : "Sign up"} for {session.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2 mb-4 border-y">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({totalSessionMinutes} min total)
            </span>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  localStorage.setItem('userName', e.target.value);
                }}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                placeholder="What will you present?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Relevant to</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id === category ? null : cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                      category === cat.id 
                        ? cat.color
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <span className="text-sm font-medium">{duration} min</span>
              </div>
              <Slider
                id="duration"
                min={5}
                max={Math.min(availableMinutes, totalSessionMinutes)}
                step={5}
                value={[duration]}
                onValueChange={(values) => setDuration(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>{Math.min(availableMinutes, totalSessionMinutes)} min</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSignUp}
              disabled={!name.trim() || !topic.trim() || duration <= 0}
            >
              {editingSlot ? "Update" : "Sign up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deletion */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Confirm removal</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this sign-up? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionCard;
