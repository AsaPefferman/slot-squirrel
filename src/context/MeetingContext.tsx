
import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks, getDay, setHours, setMinutes } from 'date-fns';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  attendee: string | null;
  topic: string | null;
}

interface MeetingContextType {
  currentWeek: Date;
  timeSlots: TimeSlot[];
  navigateToNextWeek: () => void;
  navigateToPreviousWeek: () => void;
  signUpForSlot: (slotId: string, name: string, topic: string) => void;
  cancelSignUp: (slotId: string) => void;
  isCurrentWeekInFuture: boolean;
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
    return startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  });
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Check if current week is in the future or present
  const isCurrentWeekInFuture = currentWeek >= startOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Generate time slots for the current week
  useEffect(() => {
    const newTimeSlots: TimeSlot[] = [];
    
    // We'll create slots for Thursday (4 in 0-indexed days of week)
    const thursdayOffset = 3; // Thursday is index 4, but since we start with Monday (1), it's offset 3
    const thursday = addDays(currentWeek, thursdayOffset);
    
    // Define the three sessions with their start and end times
    const sessions = [
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
    
    sessions.forEach(session => {
      // Create 10-minute slots within each session
      const startTime = new Date(thursday);
      startTime.setHours(session.startHour, session.startMinute, 0);
      
      const endTime = new Date(thursday);
      endTime.setHours(session.endHour, session.endMinute, 0);
      
      let currentSlotStart = new Date(startTime);
      
      while (currentSlotStart < endTime) {
        const slotEnd = new Date(currentSlotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 10);
        
        // Ensure we don't exceed the session end time
        const actualSlotEnd = slotEnd > endTime ? endTime : slotEnd;
        
        const id = `${format(currentSlotStart, 'yyyy-MM-dd')}-${format(currentSlotStart, 'HH-mm')}`;
        
        // Check if this slot already exists in localStorage
        const existingSlotData = localStorage.getItem(id);
        let attendee = null;
        let topic = null;
        
        if (existingSlotData) {
          try {
            const data = JSON.parse(existingSlotData);
            attendee = data.attendee;
            topic = data.topic;
          } catch (e) {
            console.error('Error parsing slot data from localStorage', e);
          }
        }
        
        newTimeSlots.push({
          id,
          startTime: new Date(currentSlotStart),
          endTime: new Date(actualSlotEnd),
          attendee,
          topic
        });
        
        currentSlotStart = slotEnd;
      }
    });
    
    setTimeSlots(newTimeSlots);
  }, [currentWeek]);
  
  const navigateToNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
  };
  
  const navigateToPreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
  };
  
  const signUpForSlot = (slotId: string, name: string, topic: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, attendee: name, topic } 
          : slot
      )
    );
    
    // Save to localStorage
    localStorage.setItem(slotId, JSON.stringify({ attendee: name, topic }));
  };
  
  const cancelSignUp = (slotId: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, attendee: null, topic: null } 
          : slot
      )
    );
    
    // Remove from localStorage
    localStorage.removeItem(slotId);
  };
  
  return (
    <MeetingContext.Provider value={{
      currentWeek,
      timeSlots,
      navigateToNextWeek,
      navigateToPreviousWeek,
      signUpForSlot,
      cancelSignUp,
      isCurrentWeekInFuture
    }}>
      {children}
    </MeetingContext.Provider>
  );
};
