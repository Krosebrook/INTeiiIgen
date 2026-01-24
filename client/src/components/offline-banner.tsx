import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = () => {
      console.log('[Network] Online');
      setIsOnline(true);
      // Show "back online" briefly then hide
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      console.log('[Network] Offline');
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker retry messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'RETRY_UPLOADS') {
          console.log('[Network] Service worker triggered upload retry');
          // Could trigger retry logic here
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to fetch health endpoint to verify connection
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-store' 
      });
      if (response.ok) {
        setIsOnline(true);
        setTimeout(() => setShowBanner(false), 1000);
      }
    } catch {
      // Still offline
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div 
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-500/90 text-white' 
          : 'bg-destructive/90 text-destructive-foreground'
      } ${!showBanner ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'}`}
      role="alert"
      aria-live="polite"
      aria-hidden={!showBanner}
      data-testid="banner-network-status"
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5" />
          <span className="font-medium">You're back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">You're offline</span>
          <span className="text-sm opacity-90">Some features may be unavailable</span>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="ml-2"
            data-testid="button-retry-connection"
          >
            {isRetrying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Retry'
            )}
          </Button>
        </>
      )}
    </div>
  );
}

// Hook for checking online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
