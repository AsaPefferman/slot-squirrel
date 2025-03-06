
import { format, isBefore, isAfter, isSameDay } from 'date-fns';

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDate = (date: Date): string => {
  return format(date, 'EEE, MMM d');
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
