
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import { Header } from "./components/Header";
import { TaskProvider } from "./contexts/TaskContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProfile } from "./components/UserProfile";
import React, { useEffect } from "react";
import { registerServiceWorker } from "./services/notificationService";
import { SharedTasks } from "./pages/SharedTasks";
import { SyncService } from "./services/syncService";
import { MobileOptimizer, MobileResponsiveHelper } from "./components/MobileResponsive";
import { OfflineStatus } from "./components/OfflineStatus";
import ForgotPassword from "./pages/ForgotPassword";

// Configure the QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

const App = () => {
  // Register service worker for offline support and notifications
  useEffect(() => {
    // Initialize service worker
    registerServiceWorker().then(success => {
      console.log(success ? "Service worker registered" : "Service worker registration failed");
    });
    
    // Initialize sync service for offline support
    SyncService.init();
    
    // Apply theme from preferences
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1">
                  {/* Mobile optimizations */}
                  <MobileOptimizer />
                  <MobileResponsiveHelper />
                  
                  {/* Offline status indicator */}
                  <div className="container px-4">
                    <OfflineStatus />
                  </div>
                  
                  <Routes>
                    {/* Public routes (don't require authentication) */}
                    <Route 
                      path="/login" 
                      element={<Login />} 
                    />
                    <Route 
                      path="/signup" 
                      element={<Signup />} 
                    />
                    <Route 
                      path="/forgot-password" 
                      element={<ForgotPassword />} 
                    />

                    {/* Protected routes (require authentication) */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/calendar" 
                      element={
                        <ProtectedRoute>
                          <Calendar />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/shared" 
                      element={
                        <ProtectedRoute>
                          <SharedTasks />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </TaskProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
