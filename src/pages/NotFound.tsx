import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Determine the likely home page based on the path
  const getHomePath = () => {
    if (location.pathname.startsWith('/coach')) {
      return '/coach/dashboard';
    }
    if (location.pathname.startsWith('/customer')) {
      return '/customer/dashboard';
    }
    return '/';
  };

  const homePath = getHomePath();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100 dark:from-black dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="p-4 bg-destructive/10 rounded-full inline-flex mb-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted px-3 py-1 rounded inline-block">
          {location.pathname}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button asChild>
            <Link to={homePath}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
