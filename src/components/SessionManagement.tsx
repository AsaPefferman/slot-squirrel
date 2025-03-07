
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
import { CalendarIcon, Clock } from 'lucide-react';
import { useMeetingContext } from '@/context/MeetingContext';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { addDays, format, isSameDay, startOfDay, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

const SessionManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { sessions, cancelSession, canceledDates } = useMeetingContext();
  
  // Get today's date
  const today = new Date();
  
  // Group sessions by date
  const sessionsByDate: Record<string, typeof sessions> = {};
  sessions.forEach(session => {
    const dateKey = format(session.startTime, 'yyyy-MM-dd');
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });
  
  // Get unique dates sorted chronologically
  const uniqueDates = Object.keys(sessionsByDate)
    .sort()
    .map(dateStr => new Date(dateStr))
    .filter(date => isAfter(date, today) || isSameDay(date, today));
  
  // Get only the next 3 dates
  const nextDates = uniqueDates.slice(0, 3);
  
  const isSessionCanceled = (date: Date) => {
    return canceledDates.some(canceledDate => isSameDay(canceledDate, date));
  };

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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Session Management</DialogTitle>
            <DialogDescription>
              View and manage your upcoming sessions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {nextDates.length > 0 ? (
              nextDates.map((date, dateIndex) => (
                <div key={dateIndex} className="space-y-3">
                  <h3 className="font-medium text-sm flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(date)}</span>
                  </h3>
                  
                  <div className="space-y-2">
                    {sessionsByDate[format(date, 'yyyy-MM-dd')]?.map((session, sessionIndex) => {
                      const sessionCanceled = isSessionCanceled(session.startTime);
                      
                      return (
                        <div 
                          key={sessionIndex}
                          className={cn(
                            "p-3 text-sm border rounded-md flex justify-between items-center",
                            sessionCanceled ? "bg-red-50 border-red-200" : "bg-card"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {session.name}: {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                            {sessionCanceled && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                                Canceled
                              </span>
                            )}
                          </div>
                          
                          {sessionCanceled ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => cancelSession(session.startTime, true)}
                            >
                              <span className="text-xs">Restore</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => handleCancel(session.startTime)}
                            >
                              <span className="text-xs">Cancel</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No upcoming sessions found
              </div>
            )}
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
