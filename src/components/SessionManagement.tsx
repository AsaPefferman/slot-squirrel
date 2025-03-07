
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
import { addDays, format, isSameDay, startOfDay } from 'date-fns';

const SessionManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { sessions, cancelSession, canceledDates, currentWeek } = useMeetingContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Compute dates that have sessions
  const sessionDates = sessions.map(session => startOfDay(session.startTime));
  
  // Generate future dates (next 30 days)
  const today = new Date();
  const futureDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      hasSession: sessionDates.some(sessionDate => isSameDay(sessionDate, date)),
      isCanceled: canceledDates.some(canceledDate => isSameDay(canceledDate, date))
    };
  }).filter(d => d.hasSession);
  
  const handleCancel = () => {
    if (selectedDate) {
      cancelSession(selectedDate);
      setSelectedDate(undefined);
    }
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
              Mark future sessions as canceled. Canceled sessions will not be available for sign-ups.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Session Calendar</h3>
              <Calendar 
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => {
                  // Only enable dates that have sessions
                  return !sessionDates.some(sessionDate => isSameDay(sessionDate, date));
                }}
                modifiers={{
                  canceled: canceledDates
                }}
                modifiersClassNames={{
                  canceled: "bg-red-100 text-red-900"
                }}
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Upcoming Sessions</h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {futureDates.length > 0 ? (
                  futureDates.map((item, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-2 text-sm border rounded-md flex justify-between items-center",
                        item.isCanceled ? "bg-red-50 border-red-200" : "bg-card"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(item.date)}</span>
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
                          <X className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Restore</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => cancelSession(item.date)}
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
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            {selectedDate && (
              <Button 
                variant="destructive"
                onClick={handleCancel}
              >
                Cancel Selected Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionManagement;
