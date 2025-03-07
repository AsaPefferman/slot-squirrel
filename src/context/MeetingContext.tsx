import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks, getDay, setHours, setMinutes, differenceInMinutes } from 'date-fns';
import { calculateAvailableMinutes } from '@/utils/dateUtils';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  attendee: string | null;
  topic: string | null;
  categories: string[] | null;
}

export interface Session {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  slots: TimeSlot[];
}

interface MeetingContextType {
  currentWeek: Date;
  sessions: Session[];
  timeSlots: TimeSlot[];
  canceledDates: Date[];
  navigateToNextWeek: () => void;
  navigateToPreviousWeek: () => void;
  signUpForSlot: (sessionId: string, startTime: Date, endTime: Date, name: string, topic: string, categories: string[] | null) => void;
  cancelSignUp: (slotId: string) => void;
  cancelSession: (date: Date, restore?: boolean) => void;
  isCurrentWeekInFuture: boolean;
  getAvailableMinutes: (sessionId: string) => number;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }
  return context;
};

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
    
    // If it's past 11:30 AM on Thursday, show next week by default
    const thursday = addDays(weekStart, 3); // Thursday is index 3 from Monday
    const thursdayCutoff = new Date(thursday);
    thursdayCutoff.setHours(11, 30, 0, 0);
    
    if (today >= thursdayCutoff && getDay(today) >= 4) { // If past 11:30 AM on Thursday
      return addWeeks(weekStart, 1); // Show next week
    }
    
    return weekStart;
  });
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [canceledDates, setCanceledDates] = useState<Date[]>(() => {
    const storedCanceled = localStorage.getItem('canceledSessions');
    if (storedCanceled) {
      try {
        return JSON.parse(storedCanceled).map((dateStr: string) => new Date(dateStr));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const isCurrentWeekInFuture = currentWeek >= startOfWeek(new Date(), { weekStartsOn: 1 });
  
  useEffect(() => {
    const thursdayOffset = 3; // Thursday is index 4, but since we start with Monday (1), it's offset 3
    const thursday = addDays(currentWeek, thursdayOffset);
    
    const sessionDefinitions = [
      { 
        name: "Session 1",
        startHour: 9, startMinute: 35, 
        endHour: 10, endMinute: 10 
      },
      { 
        name: "Session 2",
        startHour: 10, startMinute: 10, 
        endHour: 10, endMinute: 45 
      },
      { 
        name: "Session 3",
        startHour: 10, startMinute: 55, 
        endHour: 11, endMinute: 30 
      }
    ];
    
    const newSessions: Session[] = [];
    const newTimeSlots: TimeSlot[] = [];
    
    sessionDefinitions.forEach(session => {
      const sessionStartTime = new Date(thursday);
      sessionStartTime.setHours(session.startHour, session.startMinute, 0);
      
      const sessionEndTime = new Date(thursday);
      sessionEndTime.setHours(session.endHour, session.endMinute, 0);
      
      const sessionId = `session-${format(sessionStartTime, 'yyyy-MM-dd')}-${format(sessionStartTime, 'HH-mm')}`;
      const sessionSlots: TimeSlot[] = [];
      
      const existingSlots = loadSlotsFromLocalStorage(sessionStartTime, sessionEndTime);
      
      newTimeSlots.push(...existingSlots);
      sessionSlots.push(...existingSlots);
      
      newSessions.push({
        id: sessionId,
        name: session.name,
        startTime: new Date(sessionStartTime),
        endTime: new Date(sessionEndTime),
        slots: sessionSlots
      });
    });
    
    setSessions(newSessions);
    setTimeSlots(newTimeSlots);
  }, [currentWeek]);
  
  const loadSlotsFromLocalStorage = (sessionStart: Date, sessionEnd: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const sessionKey = `session-${format(sessionStart, 'yyyy-MM-dd')}-${format(sessionStart, 'HH-mm')}`;
    
    const storedData = localStorage.getItem(sessionKey);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        parsedData.slots.forEach((slotData: any) => {
          slots.push({
            id: slotData.id,
            startTime: new Date(slotData.startTime),
            endTime: new Date(slotData.endTime),
            attendee: slotData.attendee,
            topic: slotData.topic,
            categories: slotData.categories || null
          });
        });
      } catch (e) {
        console.error('Error parsing slot data from localStorage', e);
      }
    }
    
    return slots;
  };
  
  const navigateToNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
  };
  
  const navigateToPreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
  };
  
  const signUpForSlot = (sessionId: string, startTime: Date, endTime: Date, name: string, topic: string, categories: string[] | null = null) => {
    const slotId = `slot-${format(startTime, 'yyyy-MM-dd')}-${format(startTime, 'HH-mm')}-${format(endTime, 'HH-mm')}`;
    
    const newSlot: TimeSlot = {
      id: slotId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendee: name,
      topic: topic,
      categories: categories
    };
    
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          slots: [...session.slots, newSlot]
        };
      }
      return session;
    });
    
    const updatedTimeSlots = [...timeSlots, newSlot];
    
    setSessions(updatedSessions);
    setTimeSlots(updatedTimeSlots);
    
    const sessionToUpdate = updatedSessions.find(s => s.id === sessionId);
    if (sessionToUpdate) {
      localStorage.setItem(sessionId, JSON.stringify({
        slots: sessionToUpdate.slots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          attendee: slot.attendee,
          topic: slot.topic,
          categories: slot.categories
        }))
      }));
    }
  };
  
  const cancelSignUp = (slotId: string) => {
    const slotToRemove = timeSlots.find(slot => slot.id === slotId);
    if (!slotToRemove) return;
    
    const sessionContainingSlot = sessions.find(session => 
      session.slots.some(slot => slot.id === slotId)
    );
    
    if (!sessionContainingSlot) return;
    
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionContainingSlot.id) {
        return {
          ...session,
          slots: session.slots.filter(slot => slot.id !== slotId)
        };
      }
      return session;
    });
    
    const updatedTimeSlots = timeSlots.filter(slot => slot.id !== slotId);
    
    setSessions(updatedSessions);
    setTimeSlots(updatedTimeSlots);
    
    const sessionToUpdate = updatedSessions.find(s => s.id === sessionContainingSlot.id);
    if (sessionToUpdate) {
      localStorage.setItem(sessionContainingSlot.id, JSON.stringify({
        slots: sessionToUpdate.slots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          attendee: slot.attendee,
          topic: slot.topic,
          categories: slot.categories
        }))
      }));
    }
  };
  
  const cancelSession = (date: Date, restore: boolean = false) => {
    const isCanceled = canceledDates.some(canceledDate => 
      isSameDay(canceledDate, date)
    );
    
    let updatedCanceledDates: Date[];
    
    if (restore && isCanceled) {
      updatedCanceledDates = canceledDates.filter(canceledDate => 
        !isSameDay(canceledDate, date)
      );
    } else if (!restore && !isCanceled) {
      updatedCanceledDates = [...canceledDates, date];
    } else {
      return;
    }
    
    setCanceledDates(updatedCanceledDates);
    
    localStorage.setItem('canceledSessions', JSON.stringify(
      updatedCanceledDates.map(date => date.toISOString())
    ));
  };
  
  const getAvailableMinutes = (sessionId: string): number => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return 0;
    
    return calculateAvailableMinutes(
      session.startTime,
      session.endTime,
      session.slots
    );
  };
  
  return (
    <MeetingContext.Provider value={{
      currentWeek,
      sessions,
      timeSlots,
      canceledDates,
      navigateToNextWeek,
      navigateToPreviousWeek,
      signUpForSlot,
      cancelSignUp,
      cancelSession,
      isCurrentWeekInFuture,
      getAvailableMinutes
    }}>
      {children}
    </MeetingContext.Provider>
  );
};
