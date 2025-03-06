
import React from 'react';
import { useMeetingContext } from '@/context/MeetingContext';
import { formatDate, formatWeekRange, isToday } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addDays } from 'date-fns';
import TimeSlot from '@/components/TimeSlot';
import AnimatedTransition from '@/components/AnimatedTransition';
import { cn } from '@/lib/utils';

const WeeklyCalendar: React.FC = () => {
  const { 
    currentWeek, 
    timeSlots, 
    navigateToNextWeek, 
    navigateToPreviousWeek, 
    isCurrentWeekInFuture 
  } = useMeetingContext();

  // Group slots by day
  const slotsByDay = timeSlots.reduce((acc, slot) => {
    const day = formatDate(slot.startTime);
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, typeof timeSlots>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">
            {formatWeekRange(currentWeek)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
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
        {Object.entries(slotsByDay).map(([day, daySlots], index) => {
          const dayDate = daySlots[0].startTime;
          const isCurrentDay = isToday(dayDate);

          return (
            <AnimatedTransition
              key={day}
              show={true}
              animateIn="animate-scale-in"
              duration={300 + index * 100}
              className="h-full"
            >
              <Card className={cn(
                "h-full transition-all duration-300", 
                isCurrentDay && "ring-1 ring-primary/20"
              )}>
                <div className={cn(
                  "px-6 py-3 border-b", 
                  isCurrentDay && "bg-primary/5"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isCurrentDay ? "bg-primary" : "bg-muted-foreground/40"
                    )} />
                    <h3 className="font-medium">{day}</h3>
                    {isCurrentDay && (
                      <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {daySlots.map((slot) => (
                      <TimeSlot key={slot.id} slot={slot} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>
          );
        })}
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
