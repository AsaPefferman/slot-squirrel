
import React, { useState } from 'react';
import { formatTime, isSlotInPast, formatDuration } from '@/utils/dateUtils';
import { useMeetingContext, TimeSlot as TimeSlotType } from '@/context/MeetingContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Clock, UserPlus, UserCheck, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeSlotProps {
  slot: TimeSlotType;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ slot }) => {
  const { signUpForSlot, cancelSignUp, isCurrentWeekInFuture } = useMeetingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const { toast } = useToast();
  
  const isPast = isSlotInPast(slot.startTime);
  const isDisabled = isPast || !isCurrentWeekInFuture;
  const isBooked = !!slot.attendee;
  
  const handleSignUp = () => {
    if (name.trim() && topic.trim()) {
      // Find the session ID that contains this slot
      // We need to extract session ID from the slot ID or use a better approach
      const sessionId = slot.id.split('-')[1]; // Assuming slot.id format includes session ID
      
      signUpForSlot(sessionId, slot.startTime, slot.endTime, name.trim(), topic.trim());
      setIsDialogOpen(false);
      setName('');
      setTopic('');
      
      toast({
        title: "Successfully signed up!",
        description: `You're booked for ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
      });
    }
  };
  
  const handleCancel = () => {
    cancelSignUp(slot.id);
    
    toast({
      title: "Registration canceled",
      description: "You've been removed from this time slot.",
    });
  };
  
  return (
    <>
      <div 
        className={cn(
          'time-slot',
          isBooked ? 'time-slot-booked' : 'time-slot-available',
          isDisabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatDuration(slot.startTime, slot.endTime)})
            </span>
          </div>
          
          {isBooked ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{slot.attendee}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Available</span>
          )}
        </div>
        
        {isBooked && slot.topic && (
          <div className="mt-2 text-sm text-muted-foreground">
            Topic: {slot.topic}
          </div>
        )}
        
        <div className="mt-4">
          {isBooked ? (
            slot.attendee === localStorage.getItem('userName') && !isPast ? (
              <Button 
                variant="outline" 
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full pointer-events-none"
                disabled
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Booked
              </Button>
            )
          ) : (
            <Button 
              className="w-full"
              disabled={isDisabled}
              onClick={() => setIsDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Sign up
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up for time slot</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2 mb-4 border-y">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatDuration(slot.startTime, slot.endTime)})
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
          </div>
          <DialogFooter>
            <Button
              onClick={handleSignUp}
              disabled={!name.trim() || !topic.trim()}
            >
              Sign up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeSlot;
