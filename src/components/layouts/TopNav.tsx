import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface TopNavProps {
  title?: string;
}

const TopNav = ({ title }: TopNavProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations } = useConversations();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Special handling for messages page - show participant name instead of conversation ID
    if (segments.includes('messages') && lastSegment && lastSegment !== 'messages') {
      const conversationId = lastSegment;
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        const otherUser = user?.id === conversation.coach_id ? conversation.customer : conversation.coach;
        if (otherUser?.full_name) return otherUser.full_name;
        if (otherUser?.email) return otherUser.email.split('@')[0];
        return 'Unknown User';
      }
      return 'Messages';
    }
    
    if (lastSegment === 'dashboard') return 'Dashboard';
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ') : 'TrainWise';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const settingsHref = profile?.role === 'coach' ? '/coach/settings' : '/customer/settings';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-foreground truncate">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  {/* ✅ REPLACED HARDCODED COLORS WITH THEME VARIABLES */}
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none text-foreground">{profile?.full_name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={settingsHref} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
