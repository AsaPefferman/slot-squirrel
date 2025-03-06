
import React from 'react';
import { useMeetingContext, Session } from '@/context/MeetingContext';
import { formatDate, formatWeekRange, isToday, formatTime, formatFullDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addDays } from 'date-fns';
import SessionCard from '@/components/SessionCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { cn } from '@/lib/utils';

const WeeklyCalendar: React.FC = () => {
  const { 
    currentWeek, 
    sessions, 
    navigateToNextWeek, 
    navigateToPreviousWeek, 
    isCurrentWeekInFuture 
  } = useMeetingContext();

  // Find the Thursday of the current week
  const thursday = addDays(currentWeek, 3); // Thursday is 4th day, index 3 from Monday

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-center">
          {formatFullDate(thursday)}
        </h2>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToPreviousWeek}
            className="rounded-full w-10 h-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToNextWeek}
            className="rounded-full w-10 h-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <AnimatedTransition
            key={session.id}
            show={true}
            animateIn="animate-scale-in"
            duration={300 + index * 100}
            className="h-full"
          >
            <SessionCard session={session} />
          </AnimatedTransition>
        ))}
      </div>

      {!isCurrentWeekInFuture && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-center text-muted-foreground">
          You are viewing past meetings. <Button variant="link" onClick={navigateToNextWeek} className="p-0 h-auto font-normal">View current week</Button>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
