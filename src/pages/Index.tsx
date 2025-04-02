
import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  return (
    <TooltipProvider>
      <Dashboard />
    </TooltipProvider>
  );
};

export default Index;
