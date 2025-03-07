
import React, { useState } from 'react';
import { useMeetingContext } from '@/context/MeetingContext';
import { formatTime, isSlotInPast } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TimeSlotProps {
  sessionId: string;
  startTime: Date;
  endTime: Date;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ sessionId, startTime, endTime }) => {
  const { signUpForSlot } = useMeetingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const { toast } = useToast();
  
  const isPast = isSlotInPast(startTime);
  
  const handleOpen = () => {
    if (isPast) return;
    setIsDialogOpen(true);
  };
  
  const handleSignUp = () => {
    if (name.trim() && topic.trim()) {
      signUpForSlot(sessionId, startTime, endTime, name.trim(), topic.trim(), []);
      setIsDialogOpen(false);
      setName('');
      setTopic('');
      
      toast({
        title: "Successfully signed up!",
        description: `You're booked for ${formatTime(startTime)} - ${formatTime(endTime)}`,
      });
    }
  };
  
  return (
    <>
      <div 
        className={`p-2 border rounded-md mb-2 cursor-pointer hover:bg-muted/50 ${isPast ? 'opacity-50' : ''}`}
        onClick={handleOpen}
      >
        <div className="text-sm font-medium">{formatTime(startTime)} - {formatTime(endTime)}</div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up for {formatTime(startTime)} - {formatTime(endTime)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <Button onClick={handleSignUp} disabled={!name.trim() || !topic.trim()}>Sign up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeSlot;
