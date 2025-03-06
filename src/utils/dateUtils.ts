
import { format, isBefore, isAfter, isSameDay, differenceInMinutes } from 'date-fns';

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDate = (date: Date): string => {
  return format(date, 'EEE, MMM d');
};

export const formatFullDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM do');
};

export const formatWeekRange = (startDate: Date): string => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${format(startDate, 'MMMM d')} - ${format(endDate, 'd, yyyy')}`;
  } else if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;
  } else {
    return `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`;
  }
};

export const isSlotInPast = (startTime: Date): boolean => {
  const now = new Date();
  return isBefore(startTime, now);
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const formatDuration = (startTime: Date, endTime: Date): string => {
  const minutes = differenceInMinutes(endTime, startTime);
  return `${minutes} min`;
};

export const calculateAvailableMinutes = (sessionStart: Date, sessionEnd: Date, bookedSlots: { startTime: Date, endTime: Date }[]): number => {
  const totalSessionMinutes = differenceInMinutes(sessionEnd, sessionStart);
  
  // Calculate total booked minutes
  const bookedMinutes = bookedSlots.reduce((total, slot) => {
    return total + differenceInMinutes(slot.endTime, slot.startTime);
  }, 0);
  
  return totalSessionMinutes - bookedMinutes;
};
