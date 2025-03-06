
import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, startOfWeek, format, isSameDay, addWeeks, subWeeks } from 'date-fns';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  attendee: string | null;
}

interface MeetingContextType {
  currentWeek: Date;
  timeSlots: TimeSlot[];
  navigateToNextWeek: () => void;
  navigateToPreviousWeek: () => void;
  signUpForSlot: (slotId: string, name: string) => void;
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
    
    // We'll create slots for Monday, Wednesday, and Friday
    const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday (0 = Sunday, 1 = Monday, etc.)
    
    daysOfWeek.forEach(dayOffset => {
      const day = addDays(currentWeek, dayOffset);
      
      // Create 3 slots per day
      const slotTimes = [
        { start: 9, end: 9.5 },   // 9:00 - 9:30
        { start: 10, end: 10.5 }, // 10:00 - 10:30
        { start: 11, end: 11.5 }  // 11:00 - 11:30
      ];
      
      slotTimes.forEach(({ start, end }) => {
        const startHour = Math.floor(start);
        const startMinute = (start - startHour) * 60;
        const endHour = Math.floor(end);
        const endMinute = (end - endHour) * 60;
        
        const startTime = new Date(day);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(day);
        endTime.setHours(endHour, endMinute, 0);
        
        const id = `${format(day, 'yyyy-MM-dd')}-${startHour}-${startMinute}`;
        
        // Check if this slot already exists in localStorage
        const existingSlotData = localStorage.getItem(id);
        let attendee = null;
        
        if (existingSlotData) {
          try {
            const data = JSON.parse(existingSlotData);
            attendee = data.attendee;
          } catch (e) {
            console.error('Error parsing slot data from localStorage', e);
          }
        }
        
        newTimeSlots.push({
          id,
          startTime,
          endTime,
          attendee
        });
      });
    });
    
    setTimeSlots(newTimeSlots);
  }, [currentWeek]);
  
  const navigateToNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
  };
  
  const navigateToPreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
  };
  
  const signUpForSlot = (slotId: string, name: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, attendee: name } 
          : slot
      )
    );
    
    // Save to localStorage
    localStorage.setItem(slotId, JSON.stringify({ attendee: name }));
  };
  
  const cancelSignUp = (slotId: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, attendee: null } 
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
