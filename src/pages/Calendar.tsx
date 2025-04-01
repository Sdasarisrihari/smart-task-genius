
import React from 'react';

const Calendar = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">Visualize your tasks on a timeline</p>
      </header>

      <div className="bg-card rounded-lg shadow-sm border p-6 text-center">
        <div className="py-12">
          <h3 className="text-xl font-medium mb-2">Calendar View Coming Soon</h3>
          <p className="text-muted-foreground">
            This page would integrate with Google Calendar and Outlook for smart scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
