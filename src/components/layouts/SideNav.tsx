import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LogOut, Lock, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLevel } from '@/contexts/AccessLevelContext';
import { NavItem } from '@/lib/navItems';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { triggerNavHaptic } from '@/utils/haptics';

interface SideNavProps {
  navItems: NavItem[];
}

const SideNav = ({ navItems }: SideNavProps) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { canAccessRoute, getAccessDenialReason } = useAccessLevel();
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  const closeSidebar = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  // Auto-close sidebar when route changes (mobile only)
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [location.pathname, isMobile]);

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = () => {
    triggerNavHaptic();
    closeSidebar();
  };

  const showText = isMobile || !collapsed;
  const btnClass = collapsed && !isMobile ? 'justify-center px-0' : 'justify-start';

  // Determine settings path based on role
  const settingsPath = profile?.role === 'coach' ? '/coach/settings' : '/customer/settings';

  return (
    <Sidebar
      className={cn(
        "border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground transition-all duration-300",
        collapsed && !isMobile ? 'w-16' : 'w-64'
      )}
      collapsible="icon"
    >
      <SidebarContent className="px-3">
        <div
          className={cn(
            "flex items-center h-16 border-b border-border",
            collapsed && !isMobile ? 'justify-center' : ''
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 min-h-10 min-w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">TW</span>
            </div>
            {showText && <span className="font-bold text-lg text-foreground">TrainWise</span>}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed && !isMobile ? 'items-center' : ''}>
              <TooltipProvider>
                {navItems.map((item) => {
                  // Use unified access control
                  const itemHasAccess = canAccessRoute(item.href);
                  const denialReason = getAccessDenialReason(item.href);
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.href)}
                            className={cn(btnClass, !itemHasAccess && 'opacity-60')}
                          >
                            <Link 
                              to={item.href} 
                              className="flex items-center gap-3 w-full" 
                              onClick={handleNavClick}
                            >
                              <item.icon className="h-5 w-5 shrink-0" />
                              {showText && (
                                <span className="text-sm font-medium flex-1">{item.name}</span>
                              )}
                              {showText && !itemHasAccess && (
                                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {denialReason && !itemHasAccess && (
                          <TooltipContent side="right">
                            <p className="text-xs max-w-[200px]">{denialReason}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed && !isMobile ? 'items-center' : ''}>
              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(settingsPath)}
                  className={btnClass}
                >
                  <Link to={settingsPath} className="flex items-center gap-3 w-full" onClick={handleNavClick}>
                    <Settings className="h-5 w-5 shrink-0" />
                    {showText && (
                      <span className="text-sm font-medium">Settings</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Sign out */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className={btnClass}>
                  <LogOut className="h-5 w-5 shrink-0" />
                  {showText && (
                    <span className="text-sm font-medium">Sign out</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SideNav;
