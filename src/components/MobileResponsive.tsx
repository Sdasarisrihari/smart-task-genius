
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Smartphone, Laptop, Expand, Shrink, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

export const MobileResponsiveHelper = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // Check for mobile on component mount
  useEffect(() => {
    const ua = navigator.userAgent;
    const isRealMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    // Only show the toast on initial load for real mobile devices
    if (isRealMobileDevice && !sessionStorage.getItem('mobile-welcome-shown')) {
      toast.info('Mobile version detected', {
        description: 'The app has been optimized for mobile devices',
        duration: 5000,
      });
      sessionStorage.setItem('mobile-welcome-shown', 'true');
    }
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full shadow-lg bg-primary text-primary-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left mb-4">
            <SheetTitle>Quick Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center h-20"
              onClick={() => handleNavigate('/')}
            >
              <Laptop className="h-6 w-6 mb-2" />
              <span className="text-xs">Dashboard</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center h-20"
              onClick={() => handleNavigate('/settings')}
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-xs">Settings</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center h-20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <>
                  <Shrink className="h-6 w-6 mb-2" />
                  <span className="text-xs">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Expand className="h-6 w-6 mb-2" />
                  <span className="text-xs">Fullscreen</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground text-center">
            <p>Optimized for mobile devices</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// A component to apply mobile-specific styles
export const MobileOptimizer = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      // Add mobile-specific body class when on mobile
      document.body.classList.add('mobile-view');
      
      // Adjust viewport meta tag for better mobile rendering
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Ensure links open in the same window unless specified
      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        if (!link.getAttribute('rel')) {
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('mobile-view');
    };
  }, [isMobile]);
  
  return null; // This component doesn't render anything visible
};
