import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerErrorPage = () => {
  const location = useLocation();

  // Log error info in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('[Navigation Error]');
      console.log('Route:', location.pathname);
      console.log('Role: customer');
      console.log('Device:', navigator.userAgent);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }, [location]);

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-4 bg-destructive/10 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted px-3 py-1 rounded">
        {location.pathname}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleTryAgain} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild>
          <Link to="/customer/home" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CustomerErrorPage;
