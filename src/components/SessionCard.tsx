
import React, { useState } from 'react';
import { Session, useMeetingContext } from '@/context/MeetingContext';
import { formatTime, isSlotInPast } from '@/utils/dateUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserPlus, User, Clock } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { signUpForSlot, getAvailableMinutes, isCurrentWeekInFuture } = useMeetingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(10); // Default to 10 minutes
  const { toast } = useToast();
  
  const isPast = isSlotInPast(session.startTime);
  const isDisabled = isPast || !isCurrentWeekInFuture;
  
  const availableMinutes = getAvailableMinutes(session.id);
  const totalSessionMinutes = differenceInMinutes(session.endTime, session.startTime);
  
  const handleSignUp = () => {
    if (name.trim() && topic.trim() && duration > 0) {
      // Calculate end time based on selected duration
      const startTime = new Date(session.startTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + duration);
      
      signUpForSlot(session.id, startTime, endTime, name.trim(), topic.trim());
      setIsDialogOpen(false);
      setName('');
      setTopic('');
      setDuration(10);
      
      toast({
        title: "Successfully signed up!",
        description: `You're booked for ${formatTime(startTime)} - ${formatTime(endTime)}`,
      });
    }
  };
  
  return (
    <>
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <h3 className="text-lg font-semibold">{session.name}</h3>
              <p className="text-lg text-foreground">
                {formatTime(session.startTime)}-{formatTime(session.endTime)}
              </p>
            </div>
            
            {session.slots.length > 0 ? (
              <div className="space-y-3 mt-4">
                {session.slots.map(slot => (
                  <div 
                    key={slot.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                  >
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{slot.attendee}</div>
                      <div className="text-xs text-muted-foreground">{slot.topic}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)} 
                        ({differenceInMinutes(slot.endTime, slot.startTime)} min)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            
            <div className="text-center py-4">
              <p className="text-sm font-medium">{availableMinutes} min available</p>
            </div>
            
            <Button 
              className="w-full"
              disabled={isDisabled || availableMinutes === 0}
              onClick={() => setIsDialogOpen(true)}
            >
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up for {session.name}</DialogTitle>
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
              Sign up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionCard;
