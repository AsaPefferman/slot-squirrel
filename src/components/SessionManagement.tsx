
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { useMeetingContext } from '@/context/MeetingContext';
import { formatDate } from '@/utils/dateUtils';
import { addDays, format, isSameDay, startOfDay, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

const SessionManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { sessions, cancelSession, canceledDates, currentWeek } = useMeetingContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Compute dates that have sessions
  const sessionDates = sessions.map(session => startOfDay(session.startTime));
  
  // Get today's date
  const today = new Date();
  
  // Generate future dates with sessions (next 30 days)
  const futureDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      hasSession: sessionDates.some(sessionDate => isSameDay(sessionDate, date)),
      isCanceled: canceledDates.some(canceledDate => isSameDay(canceledDate, date))
    };
  }).filter(d => d.hasSession);
  
  // Get only the next 9 upcoming sessions
  const nextSessions = futureDates.slice(0, 9);
  
  const handleCancel = (date: Date) => {
    cancelSession(date);
  };

  return (
    <>
      <Button 
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={() => setOpen(true)}
      >
        Manage Sessions
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Management</DialogTitle>
            <DialogDescription>
              View and manage your upcoming sessions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <h3 className="font-medium mb-2">Next 9 Upcoming Sessions</h3>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {nextSessions.length > 0 ? (
                nextSessions.map((item, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 text-sm border rounded-md flex justify-between items-center",
                      item.isCanceled ? "bg-red-50 border-red-200" : "bg-card"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(item.date)}</span>
                      {item.isCanceled && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                          Canceled
                        </span>
                      )}
                    </div>
                    
                    {item.isCanceled ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => cancelSession(item.date, true)}
                      >
                        <span className="text-xs">Restore</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(item.date)}
                      >
                        <span className="text-xs">Cancel</span>
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No upcoming sessions found
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionManagement;
