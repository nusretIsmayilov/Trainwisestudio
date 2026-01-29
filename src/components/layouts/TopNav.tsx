import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface TopNavProps {
  title?: string;
}

const TopNav = ({ title }: TopNavProps) => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations } = useConversations();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.startsWith("/coach/dashboard")) return t("nav.dashboard");
    if (path.startsWith("/coach/clients")) return t("nav.clients");
    if (path.startsWith("/coach/messages")) return t("messages.title");
    if (path.startsWith("/coach/programs")) return t("nav.programs");
    if (path.startsWith("/coach/settings")) return t("nav.settings");
    if (path.startsWith("/coach/library")) return t("nav.library");
    if (path.startsWith("/coach/blog")) return t("nav.blog");
    if (path.startsWith("/coach/income")) return t("nav.income");

    if (path.startsWith("/customer/dashboard")) return t("nav.dashboard");
    if (path.startsWith("/customer/programs")) return t('nav.my.programs');
    if (path.startsWith("/customer/messages")) return t("messages.title");
    if (path.startsWith("/customer/settings")) return t("nav.settings");
    if (path.startsWith("/customer/library")) return t("nav.library");
    if (path.startsWith("/customer/progress")) return t("nav.progress");
    if (path.startsWith("/customer/my-coach")) return t("mycoach.myCoach");
    if (path.startsWith("/customer/blog")) return t("nav.blog");

    return "TrainWise";
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const settingsHref =
    profile?.role === "coach" ? "/coach/settings" : "/customer/settings";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-foreground truncate">
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || "User"}
                    className="object-cover"
                  />
                  {/* ✅ REPLACED HARDCODED COLORS WITH THEME VARIABLES */}
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none text-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={settingsHref}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" /> {t("nav.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer text-destructive"
              >
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
