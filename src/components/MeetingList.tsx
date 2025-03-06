
import React from 'react';
import { useMeetingContext, TimeSlot } from '@/context/MeetingContext';
import { formatDate, formatTime, isSlotInPast, formatDuration } from '@/utils/dateUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const MeetingList: React.FC = () => {
  const { timeSlots } = useMeetingContext();
  
  // Sort slots chronologically and filter to only show booked slots
  const bookedSlots = timeSlots
    .filter(slot => !!slot.attendee)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const upcomingSlots = bookedSlots.filter(slot => !isSlotInPast(slot.startTime));
  const pastSlots = bookedSlots.filter(slot => isSlotInPast(slot.startTime));
  
  if (bookedSlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No sessions have been booked yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {upcomingSlots.length > 0 ? (
          <div className="space-y-4">
            {upcomingSlots.map((slot) => (
              <SlotItem key={slot.id} slot={slot} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No upcoming sessions.</p>
          </div>
        )}
        
        {pastSlots.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Past Sessions</h3>
              <div className="space-y-3 opacity-70">
                {pastSlots.slice(0, 3).map((slot) => (
                  <SlotItem key={slot.id} slot={slot} isPast />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface SlotItemProps {
  slot: TimeSlot;
  isPast?: boolean;
}

const SlotItem: React.FC<SlotItemProps> = ({ slot, isPast = false }) => {
  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-3 rounded-lg border",
        isPast ? "bg-muted/30" : "bg-card"
      )}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-grow">
        <div className="font-medium">{slot.attendee}</div>
        <div className="text-sm text-muted-foreground mt-1">{slot.topic}</div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(slot.startTime)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            ({formatDuration(slot.startTime, slot.endTime)})
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingList;
