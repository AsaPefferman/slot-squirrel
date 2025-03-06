
import React from 'react';
import { MeetingProvider } from '@/context/MeetingContext';
import Header from '@/components/Header';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import MeetingList from '@/components/MeetingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List } from 'lucide-react';

const Index = () => {
  return (
    <MeetingProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow py-6">
          <div className="container max-w-6xl">
            <Tabs defaultValue="calendar" className="space-y-8">
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>Sessions</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="calendar" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
                <WeeklyCalendar />
              </TabsContent>
              
              <TabsContent value="list" className="space-y-8 max-w-2xl mx-auto focus-visible:outline-none focus-visible:ring-0">
                <MeetingList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <footer className="py-6 border-t">
          <div className="container text-center text-sm text-muted-foreground">
            Team Meeting Scheduler &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </MeetingProvider>
  );
};

export default Index;
